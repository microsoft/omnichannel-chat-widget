import { Constants } from "../../../../common/Constants";
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
        const {tags, ConversationId} = additionalData;
        if (ConversationId) {
            activity.channelData.conversationId = ConversationId;
        }

        if (tags) {
            const formattedTags = additionalData.tags.split(",");
            activity.channelData.tags = [...activity.channelData.tags, ...formattedTags];
        }
    }

    if (from?.user?.displayName) {
        activity.from.name = from.user.displayName;  
    }

    if (from?.application?.displayName === "Customer") {
        activity.from = {
            role: "user",
            name: from.application.displayName
        };
    }

    if (content) {
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