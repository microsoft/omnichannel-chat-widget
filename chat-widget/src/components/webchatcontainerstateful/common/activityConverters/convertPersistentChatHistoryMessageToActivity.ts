import { Constants } from "../../../../common/Constants";
import { SupportedAdaptiveCards } from "@microsoft/omnichannel-chat-sdk/lib/utils/printers/interfaces/SupportedAdaptiveCards";
import botActivity from "../activities/botActivity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertStringValueToInt = (value: any) => {
    if (typeof value !== "string" || value === "") {
        return undefined;
    }

    let result;
    try { 
        result = parseInt(value);
    } catch (e) {
        return undefined;
    }

    return isNaN(result) ? undefined : result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertPersistentChatHistoryMessageToActivity = (message: any) => {
    const {additionalData, attachments, content, created, from, transcriptOriginalMessageId} = message;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const activity: any = {
        ...botActivity,
        channelData: {
            tags: [Constants.persistentChatHistoryMessageTag]
        }
    };

    let webchatSequenceId;
    let timestamp;
    if (transcriptOriginalMessageId) { 
        const id = convertStringValueToInt(transcriptOriginalMessageId); // Id used to determine the sequence of messages which is the same as the 'live' messages
        if (id) {
            webchatSequenceId = id;
            timestamp = new Date(id) || created;
            activity.channelData = {
                ...activity.channelData,
                "webchat:sequence-id": webchatSequenceId
            };
        }
    }

    if (additionalData?.tags) {
        const formattedTags = additionalData.tags.split(",");
        activity.channelData = {
            ...activity.channelData,
            tags: [...activity.channelData.tags, ...formattedTags]
        };
    }

    if (additionalData?.ConversationId) {
        activity.channelData.conversationId = additionalData.ConversationId;
    }

    if (from?.user?.displayName) {
        activity.from = {
            ...activity.from,
            name: from.user.displayName
        };
    }

    if (from?.application?.displayName === "Customer") {
        activity.from = {
            role: "user",
            name: from.application.displayName
        };
    }

    if (content) {
        // Check if content contains adaptive card or rich card JSON using SupportedAdaptiveCards enum
        const isAdaptiveCard = content.toLowerCase().includes(Constants.AdaptiveCardType);
        const isSuggestedActions = content.toLowerCase().includes(Constants.SuggestedActionsType);
        const containsSupportedCard = Object.values(SupportedAdaptiveCards).some(type => content.toLowerCase().includes(type.toLowerCase()));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let parsedContent: any;

        try {
            parsedContent = JSON.parse(content);
        } catch (error) {
            console.error("Failed to parse content as JSON:", error);
            parsedContent = null; // fall back to normal text handling
        }

        // Check if this is a customer form submission response (e.g., RichObjectMessage_Form)
        // These should be ignored as they are form submission data, not displayable content
        const isFromCustomer = from?.application?.displayName === "Customer";
        if (isFromCustomer && parsedContent?.value?.type === "RichObjectMessage_Form") {
            return null;
        }

        if (parsedContent && (isAdaptiveCard || isSuggestedActions || containsSupportedCard)) {
            return {
                ...activity,
                ...parsedContent,
                timestamp,
                channelData: {
                    ...activity.channelData,
                    "webchat:sequence-id": webchatSequenceId
                }
            };
        }
        
        // Plain text message
        return {
            ...activity,
            text: content,
            timestamp
        };
    }

    if (attachments && attachments.length > 0) {
        const fileName = attachments[0].name || "Unknown";
        const text = `The following attachment was uploaded during the conversation: ${fileName}`;
        return {
            ...activity,
            text,
            timestamp
        };
    }
    // If neither content nor attachments are present, return null to indicate no activity could be created.
    return null;
};

export default convertPersistentChatHistoryMessageToActivity;