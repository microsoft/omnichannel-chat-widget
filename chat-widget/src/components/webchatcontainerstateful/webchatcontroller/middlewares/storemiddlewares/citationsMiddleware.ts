import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { Dispatch } from "redux";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";

export const createCitationsMiddleware = ({ dispatch }: { dispatch: Dispatch<IWebChatAction> }) => (next: Dispatch<IWebChatAction>) => (action: IWebChatAction) => {
    if (action.payload?.activity) {
        if (isApplicable(action)) {

            try {
                const gptFeedback = JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"]);
                // Replace citations in the text
                const updatedText = replaceCitations(action.payload.activity.text, gptFeedback.summarizationOpenAIResponse.result.textCitations);
                action.payload.activity.text = updatedText;
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