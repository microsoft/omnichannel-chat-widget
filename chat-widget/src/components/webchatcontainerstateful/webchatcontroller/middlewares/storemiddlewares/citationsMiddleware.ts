import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { LiveChatWidgetActionType } from "../../../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { executeReducer } from "../../../../../contexts/createReducer";

// Middleware that extracts citation metadata from incoming ACS activities and
// updates in-memory app state with a global citation map. Also rewrites
// per-message citation labels in the activity text to use a stable,
// message-scoped prefix when the producer provides a message id.

export const createCitationsMiddleware = (state: ILiveChatWidgetContext,
    dispatch: (action: ILiveChatWidgetAction) => void) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {

    if (action.payload?.activity) {
        if (isApplicable(action)) {

            try {
                // Use the producer-supplied messageid as a stable per-message prefix
                // when present. Do not derive a prefix from activity.id or timestamps.
                const messagePrefix = action.payload?.activity?.messageid ?? "";
                const gptFeedback = JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"]);
                // Extract citation objects from the model response
                const citations = gptFeedback.summarizationOpenAIResponse?.result?.textCitations;
                // Rewrite inline citation labels in activity.text to match the global map keys
                const updatedText = replaceCitations(action.payload.activity.text, citations, messagePrefix);

                console.error("LOPEZ Citation:Text =>", updatedText);

                action.payload.activity.text = updatedText;
                // Build a global citation map keyed by the prefixed citation id and
                // dispatch it to app state so the UI container can render citations.
                try {
                    const citationMap: Record<string, string> = {};

                    if (citations && Array.isArray(citations)) {
                        (citations as unknown as Array<{ id?: string; text?: string; title?: string }> ).forEach((citation) => {
                            if (citation?.id) {
                                // Preserve the 'cite:' scheme so renderer click handling remains consistent
                                const idWithoutScheme = citation.id.replace(/^cite:/, "");
                                const prefixedId = `cite:${messagePrefix}_${idWithoutScheme}`;
                                citationMap[prefixedId] = citation.text || citation.title || "";
                            }
                        });
                    }

                    // Read current in-memory state to merge with existing citations
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
        // Only applicable for ACS incoming activities that include pva:gpt-feedback
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
        let updatedText = text;

        // First, handle the citation reference definitions at the end (e.g., [1]: cite:1757450535119_1 "index.html")
        // These should NOT be escaped as they are proper citation definitions
        updatedText = updatedText.replace(/\[(\d+)\]:\s(cite:\d+)\s"([^\\"]+)"/g, (match, number, citeId) => {
            // Attempt to find a citation object matching the inline cite id and
            // update the displayed id/title. When a messagePrefix exists we
            // rewrite the id to the prefixed form so it aligns with the
            // global citation map keys.
            const lookupId = citeId;
            const citation = citations.find(c => c.id === lookupId);
            if (citation) {
                const idWithoutScheme = citeId.replace(/^cite:/, "");
                const prefixed = messagePrefix ? `cite:${messagePrefix}_${idWithoutScheme}` : citeId;
                return `[${number}]: ${prefixed} "${citation.title}"`;
            }
            return match;
        });

        // Second, escape inline citation references that are NOT followed by a colon
        // This handles cases like [1]​[2] in the middle of text that should be escaped for markdown
        updatedText = updatedText.replace(/\[(\d+)\](?!:)/g, (match, number) => {
            // Escape the brackets to prevent markdown from treating them as incomplete link syntax
            return `&#91;${number}&#93;`;
        });

        return updatedText;
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