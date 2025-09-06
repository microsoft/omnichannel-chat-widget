import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { executeReducer } from "../../../../../contexts/createReducer";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { LiveChatWidgetActionType } from "../../../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";

// Now requires a dispatch to always persist citations into app state

export const createCitationsMiddleware = (state: ILiveChatWidgetContext,
    dispatch: (action: ILiveChatWidgetAction) => void) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {


    if (action.payload?.activity) {
        if (isApplicable(action)) {

            try {
                console.log("LOPEZ:@@ -<", action.payload.activity);
                // Use explicit per-message id only when provided by the producer (e.g. `messageid_citeN`).
                // Do NOT fallback to activity.id or timestamp — keep default behavior unchanged so tests
                // and existing consumers that expect `cite:1` continue to work.
                // Use the activity's messageid as the per-message prefix. This field is
                // populated by the host and is the correct source for a stable message
                // scoped prefix. Fall back to empty string only if missing.
                const messagePrefix = action.payload?.activity?.messageid ?? "";
                const gptFeedback = JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"]);
                // Build citation mapping and expose it for the container to render in a pane.
                const citations = gptFeedback.summarizationOpenAIResponse?.result?.textCitations;
                // Keep replacing citation labels in the raw text where possible
                // When replacing citations in the text, the original citations may use ids like cite:1
                // We will map those to unique ids by prefixing with the messagePrefix. The citations array
                // is expected to contain ids like "cite:1" — we'll create a mapping keyed by the prefixed id.
                const updatedText = replaceCitations(action.payload.activity.text, citations, messagePrefix);
                action.payload.activity.text = updatedText;

                // Populate a global citation map used by the UI container. Middleware must not attach DOM handlers or
                // create UI elements to avoid duplicates — container will render a pane.
                try {
                    const citationMap: Record<string, string> = {};
                    if (citations && Array.isArray(citations)) {
                        (citations as unknown as Array<{ id?: string; text?: string; title?: string }> ).forEach((citation) => {
                            if (citation?.id) {
                                // Preserve the 'cite:' scheme at the start so the renderer produces an
                                // href that starts with 'cite:' and the click handler can intercept it.
                                const idWithoutScheme = citation.id.replace(/^cite:/, "");
                                const prefixedId = `cite:${messagePrefix}_${idWithoutScheme}`;
                                citationMap[prefixedId] = citation.text || citation.title || "";
                            }
                        });
                    }

                    // Read the latest in-memory state instead of relying on the
                    // `state` object captured when the middleware was created. This
                    // prevents losing previously stored citations when the widget
                    // re-initializes because `state` will otherwise be stale.
                    const inMemoryState = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: null });
                    const existingCitations = inMemoryState?.domainStates?.citations || {};
                    const updatedCitations = { ...existingCitations, ...citationMap };
                    // Always dispatch to app state
                    dispatch({ type: LiveChatWidgetActionType.SET_CITATIONS, payload: updatedCitations });

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

const replaceCitations = (text: string, citations: Array<{ id: string; title: string }>, messagePrefix?: string): string => {
    if (!citations || !Array.isArray(citations)) {
        return text;
    }

    try {
        return text.replace(/\[(\d+)\]:\s(cite:\d+)\s"([^"]+)"/g, (match, number, citeId) => {
            // If a messagePrefix is provided, we will rewrite the citation id in the text to the
            // prefixed form so it matches the global citation map keys.
            const lookupId = citeId;
            const citation = citations.find(c => c.id === lookupId);
            if (citation) {
                // Always produce a prefixed citation id so it lines up with the keys stored in the
                // global citation map. This intentionally uses the messagePrefix even if undefined
                // so the produced id will consistently follow the `cite:<prefix>_<id>` shape.
                const idWithoutScheme = citeId.replace(/^cite:/, "");
                // Always update the displayed title. Only rewrite the citation id when a
                // messagePrefix is supplied by the producer so we don't alter existing
                // non-prefixed ids used in other parts of the system or by tests.
                const prefixed = messagePrefix ? `cite:${messagePrefix}_${idWithoutScheme}` : citeId;
                return `[${number}]: ${prefixed} "${citation.title}"`;
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