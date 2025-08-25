/* eslint-disable @typescript-eslint/no-explicit-any */

import { IWebChatAction } from "../../../interfaces/IWebChatAction";

export const createCitationsMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    console.log("LOPEZ :: createCitationsMiddleware :: action => ", action);
    console.log("LOPEZ :: createCitationsMiddleware :: action.payload => ", action.payload);

    if (action.payload?.activity) {
        console.log("LOPEZ :: createCitationsMiddleware :: action.payload.activity => ", action.payload.activity);
        if (isApplicable(action)) {
            console.error("LOPEZ :: printing message => ", action.payload.activity.text);
            console.error("LOPEZ :: printing activity ::=>", action.payload.activity);

            try {
                const gptFeedback = JSON.parse(action.payload.activity.channelData.metadata["pva:gpt-feedback"]);
                console.error("LOPEZ :: printing gptFeedback => ", gptFeedback);

                // Replace citations in the text
                const updatedText = replaceCitations(action.payload.activity.text, gptFeedback.summarizationOpenAIResponse.result.textCitations);
                action.payload.activity.text = updatedText;

                console.error("LOPEZ :: updated text => ", updatedText);
            } catch (error) {
                console.error("LOPEZ :: Error processing citations => ", error);
                // Keep the original text in case of issues
                console.error("LOPEZ :: Keeping original text => ", action.payload.activity.text);
            }
        }
    }
    return next(action);
};

const isApplicable = (action: IWebChatAction): boolean => {

    if (action?.payload?.activity?.actionType === "DIRECT_LINE/INCOMING_ACTIVITY" && action?.payload?.activity?.channelId == "ACS_CHANNEL") {
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
        console.error("LOPEZ :: Error replacing citations => ", error);
        // Return the original text in case of issues
        return text;
    }
};