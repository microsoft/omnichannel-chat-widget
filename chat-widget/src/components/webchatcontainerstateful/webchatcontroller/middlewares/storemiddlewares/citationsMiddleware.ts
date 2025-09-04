/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { Dispatch } from "redux";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";

export const createCitationsMiddleware = ({ dispatch }: { dispatch: Dispatch<IWebChatAction> }) => (next: Dispatch<IWebChatAction>) => (action: IWebChatAction) => {
    if (action.payload?.activity) {
        if (isApplicable(action)) {

            try {
                console.log("LOPEZ :: Payload Activity:", action?.payload?.activity);
                const gptFeedback = JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"]);
                // Replace citations in the text using both gptFeedback and activity.citation
                const citationsFromFeedback = gptFeedback?.summarizationOpenAIResponse?.result?.textCitations;
                const updatedText = replaceCitations(action.payload.activity, action.payload.activity.text, citationsFromFeedback);
                console.log("LOPEZ :: Updated text:", updatedText);
                action.payload.activity.text = updatedText;

                // Ensure global cite link handler is installed once
                try { ensureCiteLinkHandler(); } catch (e) { /* ignore */ }
            } catch (error) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.CitationMiddlewareFailed,
                    ExceptionDetails: {
                        ErrorData: "Error while converting citation labels",
                        Exception: error
                    }
                });
            }
        }
    }

    if (action.payload?.activity?.text?.includes("cite:")) {
        console.log("LOPEZ :: Adding citation metadata to activity");
        try { ensureCiteLinkHandler(); } catch (e) { /* ignore */ }

        action.payload.activity.citation = [
            {
                "@id": "cite:1",
                "@type": "Claim",
                "appearance": {
                    "@type": "DigitalDocument",
                    "name": "Citation-1",
                    "text": "Details about Citation-1"
                },
                "position": "1"
            }
        ];
    }

    /* console.log("LOPEZ :: Checking for citations in activity text");
     if (action.payload?.activity?.text?.includes("cite:")) {
         console.log("LOPEZ :: Adding citation metadata to activity");
         action.payload.activity.citation = [
             {
                 "@id": "cite:1",
                 "@type": "Claim",
                 "appearance": {
                     "@type": "DigitalDocument",
                     "name": "Citation-1",
                     "text": "Details about Citation-1"
                 },
                 "position": "1"
             }
         ];
         console.log("222 LOPEZ :: Citation metadata added:", action.payload.activity);
 
         // Handle the case where pva:gpt-feedback is present
         const gptFeedback = action.payload.activity.channelData?.metadata?.["pva:gpt-feedback"]
             ? JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"])
             : null;
         const citationsFromFeedback = action.payload.activity.citation;
 
         const updatedText = replaceCitations(action.payload.activity, action.payload.activity.text, citationsFromFeedback);
         console.log("222 LOPEZ :: Updated text:", updatedText);
         action.payload.activity.text = updatedText;
     }
 }*/


    return next(action);
};

const isApplicable = (action: IWebChatAction): boolean => {

    if (action?.payload?.activity?.actionType === "DIRECT_LINE/INCOMING_ACTIVITY" &&
        action?.payload?.activity?.channelId === "ACS_CHANNEL") {
        // Validate if pva:gpt-feedback exists and is not null
        /*if (action?.payload?.activity?.channelData?.metadata?.["pva:gpt-feedback"]) {
            return true;
        }*/

        if (action.payload.activity.text.includes("cite:")) {
            return true;
        }
    }
    return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const replaceCitations = (activity: any, text: string, citationsFromFeedback: Array<{ id: string; title: string }> | undefined): string => {
    if (!text || typeof text !== "string") return text;

    try {
        const originalText = text;

        // 1) collect inline definitions [N]: value
        const defRegex = /^\s*\[(\d+)\]:\s*(.+)$/gm;
        const defs = new Map<number, string>();
        let defMatch: RegExpExecArray | null;
        while ((defMatch = defRegex.exec(originalText)) !== null) {
            const id = Number(defMatch[1]);
            const val = defMatch[2] || "";
            defs.set(id, val.trim());
        }

        const resolveCitationText = (id: number, fallback?: string) => {
            if (defs.has(id)) return defs.get(id) as string;
            // try feedback citations first
            try {
                if (Array.isArray(citationsFromFeedback)) {
                    const found = citationsFromFeedback.find(c => c.id === `cite:${id}` || c.id === `cite:${id}`);
                    if (found && found.title) return found.title;
                }
            } catch (e) { /* ignore */ }

            // then activity.citation
            try {
                const citations = (activity && activity.citation) || activity.citations || null;
                if (Array.isArray(citations)) {
                    const tryIndex = id - 1;
                    const altIndex = id;
                    const citeObj = citations[tryIndex] ?? citations[altIndex];
                    if (citeObj) {
                        const appearance = citeObj.appearence || citeObj.appearance || citeObj;
                        if (appearance && typeof appearance.text === "string") return appearance.text;
                    }
                }
            } catch (e) { /* ignore */ }

            return fallback || `Citation-${id}`;
        };

        let newText = originalText;

        // replace cite:N "Label"
        const citeRegex = /cite:(\d+)(?:\s*"([^"]+)")?/g;
        newText = newText.replace(citeRegex, (_match: any, idStr: string, label: string) => {
            const idNum = Number(idStr);
            const resolved = resolveCitationText(idNum, label);
            const display = label || resolved || `Citation-${idStr}`;
            return `<a href="javascript:void(0)" class="ocw-cite-link" role="button" data-cite-text="${escapeHtmlAttribute(resolved)}">${escapeHtmlAttribute(display)}</a>`;
        });

        // replace inline [N] references (but not definition lines)
        const inlineRegex = /\[(\d+)\](?!:)/g;
        newText = newText.replace(inlineRegex, (_match: any, idStr: string) => {
            const idNum = Number(idStr);
            const resolved = resolveCitationText(idNum);
            return `<a href="javascript:void(0)" class="ocw-cite-link" role="button" data-cite-text="${escapeHtmlAttribute(resolved)}">[${escapeHtmlAttribute(idStr)}]</a>`;
        });

        // Remove inline definition lines like: [N]: ... to avoid rendering them literally
        newText = newText.replace(defRegex, "");

        // Ensure click handler is present so anchors open the modal
        try { ensureCiteLinkHandler(); } catch (e) { /* ignore */ }

        return newText;
    } catch (error) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.CitationMiddlewareFailed,
            ExceptionDetails: {
                ErrorData: "Error while finding citations references",
                Exception: error
            }
        });
        return text;
    }
};

// Ensure a global handler that attaches listeners directly to citation elements.
// This avoids delegating at document-level and does not require modifying text nodes.
function ensureCiteLinkHandler(): void {
    const key = "__ocw_cite_link_handler_installed__";
    if ((window as any)[key]) return;

    const attached = new WeakSet<HTMLElement>();

    const attachToElement = (el: HTMLElement) => {
        if (attached.has(el)) return;
        const clickHandler = (ev: Event) => {
            try {
                ev.preventDefault();
                // For webchat-rendered citation anchors we don't have data attributes.
                // Always open the modal with the default long text (no navigation).
                showTextModal("");
            } catch (err) {
                console.warn("Error handling cite element click", err);
            }
        };
        el.addEventListener("click", clickHandler, true);
        attached.add(el);
    };

    const attachToAll = (root: ParentNode = document) => {
        try {
            // Include webchat-rendered anchor class for link definitions so we can
            // attach listeners to anchors like
            // <a class="webchat__link-definitions__list-item-box webchat__link-definitions__list-item-box--as-link" href="cite:1">
            // Only target anchors that are rendered by webchat or have href starting with cite:
            const nodes = root.querySelectorAll && root.querySelectorAll("a[href^=\"cite:\"], a.webchat__link-definitions__list-item-box--as-link");
            if (!nodes) return;
            nodes.forEach(node => {
                if (node instanceof HTMLElement) attachToElement(node);
            });
        } catch (err) {
            /* ignore */
        }
    };

    // Attach to any existing elements now
    attachToAll(document);

    // Observe for future nodes being added to the DOM
    const observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            if (m.type === "childList" && m.addedNodes && m.addedNodes.length) {
                m.addedNodes.forEach(n => {
                    try {
                        if (n instanceof HTMLElement) {
                            // If the added node itself is a cite link
                            if (n.matches && (n.matches("a[href^=\"cite:\"]") || n.matches("a.webchat__link-definitions__list-item-box--as-link"))) {
                                attachToElement(n);
                            }
                            // Or contains descendant cite links
                            attachToAll(n);
                        }
                    } catch (e) {
                        /* ignore */
                    }
                });
            }
        }
    });

    observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
    // Store references so multiple callers don't create duplicate observers/attachments
    (window as any)[key] = { observer };
}

// Generic modal used by the middleware
function showTextModal(content: string): void {
    try {
        const DEFAULT_LONG_TEXT = `This is a detailed citation placeholder. The original citation content was not available.
Please consult the source material or contact support for the full details. This placeholder is intentionally
long to simulate verbose citation content and to provide context in cases where automatic extraction
failed or the source did not include the citation text. Use this message to guide users to the
appropriate source or documentation.`;

        let modal = document.getElementById("ocw-tacos-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "ocw-tacos-modal";
            modal.style.position = "fixed";
            modal.style.top = "0";
            modal.style.left = "0";
            modal.style.width = "100%";
            modal.style.height = "100%";
            modal.style.display = "flex";
            modal.style.alignItems = "center";
            modal.style.justifyContent = "center";
            modal.style.background = "rgba(0,0,0,0.4)";
            modal.style.zIndex = "2147483647";

            const box = document.createElement("div");
            box.style.background = "#fff";
            box.style.padding = "20px";
            box.style.borderRadius = "6px";
            box.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
            box.style.maxWidth = "90%";
            box.style.textAlign = "center";

            const text = document.createElement("div");
            text.id = "ocw-tacos-modal-text";
            text.style.fontSize = "18px";
            text.style.marginBottom = "12px";

            const close = document.createElement("button");
            close.textContent = "Close";
            close.style.padding = "8px 12px";
            close.style.cursor = "pointer";
            close.addEventListener("click", () => {
                modal && modal.remove();
            });

            box.appendChild(text);
            box.appendChild(close);
            modal.appendChild(box);
            document.body.appendChild(modal);
        }
        const textDiv = document.getElementById("ocw-tacos-modal-text");
        const finalContent = (content && String(content).trim()) ? content : DEFAULT_LONG_TEXT;
        if (textDiv) textDiv.textContent = finalContent;
        modal.style.display = "flex";
    } catch (err) {
        console.warn("Failed to show modal", err);
    }
}

// Minimal attribute escaper for injecting into data- attributes
function escapeHtmlAttribute(s: string): string {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}