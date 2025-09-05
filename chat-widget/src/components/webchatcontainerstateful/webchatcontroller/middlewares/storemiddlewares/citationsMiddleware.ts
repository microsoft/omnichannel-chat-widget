import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { Dispatch } from "redux";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";

export const createCitationsMiddleware = (_opts?: { dispatch?: Dispatch<IWebChatAction> }) => (next: Dispatch<IWebChatAction>) => (action: IWebChatAction) => {
    // Reference _opts to avoid "defined but never used" lint errors when caller provides an object
    void _opts;
    if (action.payload?.activity) {
        if (isApplicable(action)) {

            try {
                console.log("LOPEZ :: TAKE :: 3");
                const gptFeedback = JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"]);
                // Build citation mapping and expose it for the container to render in a pane.
                const citations = gptFeedback.summarizationOpenAIResponse?.result?.textCitations;
                // Keep replacing citation labels in the raw text where possible
                const updatedText = replaceCitations(action.payload.activity.text, citations);
                action.payload.activity.text = updatedText;

                // Populate a global citation map used by the UI container. Middleware must not attach DOM handlers or
                // create UI elements to avoid duplicates — container will render a pane.
                try {
                    const map: Record<string, string> = {};
                    if (citations && Array.isArray(citations)) {
                        (citations as unknown as Array<{ id?: string; text?: string; title?: string }> ).forEach((c) => {
                            if (c?.id) {
                                map[c.id] = c.text || c.title || "";
                            }
                        });
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (window as any).__ocwCitations = Object.assign((window as any).__ocwCitations || {}, map);
                } catch (innerErr) {
                    TelemetryHelper.logActionEvent(LogLevel.WARN, {
                        Event: TelemetryEvent.CitationMiddlewareFailed,
                        ExceptionDetails: {
                            ErrorData: "Error while populating citation map",
                            Exception: innerErr
                        }
                    });
                }
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
    return next(action);
};

const isApplicable = (action: IWebChatAction): boolean => {

    if (action?.payload?.activity?.actionType === "DIRECT_LINE/INCOMING_ACTIVITY" && 
        action?.payload?.activity?.channelId === "ACS_CHANNEL") {
        // Validate if pva:gpt-feedback exists and is not null
        if (action?.payload?.activity?.channelData?.metadata?.["pva:gpt-feedback"]) {
            return true;
        }
    }
    return false;
};

const replaceCitations = (text: string, citations: Array<{ id: string; title: string }>): string => {
    if (!citations || !Array.isArray(citations)) {
        return text;
    }

    try {
        return text.replace(/\[(\d+)\]:\s(cite:\d+)\s"([^"]+)"/g, (match, number, citeId) => {
            const citation = citations.find(c => c.id === citeId);
            if (citation) {
                // Replace only the citation label while preserving the original format
                return `[${number}]: ${citeId} "${citation.title}"`;
            }
            return match; // Keep the original match if no replacement is found
        });
    } catch (error) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.CitationMiddlewareFailed,
            ExceptionDetails: {
                ErrorData: "Error while finding citations references",
                Exception: error
            }
        });
        // Return the original text in case of issues
        return text;
    }
};

/**
 * Install a delegated click handler (once) and store citation mapping on window for runtime lookup.
 * This avoids mutating rendered anchor markup and keeps styling intact.
 */
// ensureCitationHandler removed: UI is handled by container panes

const showCitationModal = (id: string, content: string) => {
    // Create modal container if not exists
    const modalId = "webchat-citation-modal";
    let modal = document.getElementById(modalId) as HTMLDivElement | null;
    if (!modal) {
        modal = document.createElement("div");
        modal.id = modalId;
        // Minimal styling to avoid external stylesheet dependencies and limit visual breakage
        modal.style.position = "fixed";
        modal.style.left = "50%";
        modal.style.top = "50%";
        modal.style.transform = "translate(-50%, -50%)";
        modal.style.maxWidth = "80%";
        modal.style.maxHeight = "80%";
        modal.style.overflow = "auto";
        modal.style.background = "white";
        modal.style.border = "1px solid rgba(0,0,0,0.2)";
        modal.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        modal.style.zIndex = "100000";
        modal.style.padding = "16px";
        modal.style.borderRadius = "6px";

        // Close button
        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Close";
        closeBtn.style.position = "absolute";
        closeBtn.style.right = "8px";
        closeBtn.style.top = "8px";
        closeBtn.onclick = () => {
            if (modal) modal.style.display = "none";
        };
        modal.appendChild(closeBtn);

        // Title
        const titleEl = document.createElement("div");
        titleEl.id = `${modalId}-title`;
        titleEl.style.fontWeight = "600";
        titleEl.style.marginBottom = "8px";
        modal.appendChild(titleEl);

        // Content
        const contentEl = document.createElement("div");
        contentEl.id = `${modalId}-content`;
        contentEl.style.whiteSpace = "pre-wrap";
        modal.appendChild(contentEl);

        document.body.appendChild(modal);
    }

    const titleEl = document.getElementById(`${modalId}-title`);
    const contentEl = document.getElementById(`${modalId}-content`);
    if (titleEl) titleEl.innerText = id;
    if (contentEl) contentEl.innerHTML = content; // content may contain HTML
    if (modal) modal.style.display = "block";
};