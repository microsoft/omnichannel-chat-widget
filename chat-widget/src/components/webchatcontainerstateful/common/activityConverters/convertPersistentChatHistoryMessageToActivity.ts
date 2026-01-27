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

        if (isAdaptiveCard || isSuggestedActions || containsSupportedCard) {
            try {
                const partialActivity = JSON.parse(content);
                return {
                    ...activity,
                    ...partialActivity,
                    timestamp,
                    channelData: {
                        ...activity.channelData,
                        "webchat:sequence-id": webchatSequenceId
                    }
                };
            } catch (error) {
                // If parsing fails, treat as plain text
                console.error("Failed to parse adaptive card content:", error);
            }
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