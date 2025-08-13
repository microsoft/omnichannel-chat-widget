import botActivity from "../activities/botActivity";

const convertStringValueToInt = (value: any) => {
    if (typeof value !== "string" || value === "") {
        return undefined;
    }

    let result;
    try { 
        result = parseInt(value);
    } catch (e) {
        return undefined
    }

    return isNaN(result) ? undefined : result;
}

const convertPersistentChatHistoryMessageToActivity = (message: any) => {
    const {additionalData, attachments, content, created, from, transcriptOriginalMessageId} = message;
    const activity: any = {
        ...botActivity
    };

    let webchatSequenceId;
    let timestamp;
    if (transcriptOriginalMessageId) { 
        let id = convertStringValueToInt(transcriptOriginalMessageId); // Id used to determine the sequence of messages which is the same as the 'live' messages
        if (id) {
            webchatSequenceId = id;
            timestamp = new Date(id) || created;
        }
    }

    if (additionalData && additionalData.tags) {
        const {tags, ConversationId} = additionalData;
        activity.channelData = {};

        if (ConversationId) {
            activity.channelData.conversationId = ConversationId;
        }

        if (tags) {
            const formattedTags = additionalData.tags.split(",");
            activity.channelData.tags = [...formattedTags, "persistent-chat-history"];
        }
    }

    if (from && from.user && from.user.displayName) {
        activity.from.name = from.user.displayName;  
    }

    if (from && from.application && from.application.displayName && from.application.displayName === "Customer") {
        activity.from = {
            role: "user",
            name: from.application.displayName
        };
    }

    if (content) {
        return {
            ...activity,      
            text: content,
            timestamp,
            channelData: {        
                ...activity.channelData,
                "webchat:sequence-id": webchatSequenceId
            }
        }
    }

    if (attachments && attachments.length > 0) {
        const fileName = attachments[0].name || 'Unknown';
        const text = `The following attachment was uploaded during the conversation: ${fileName}`;
        return {
            ...activity,
            text,
            timestamp,
            channelData: {        
                ...activity.channelData,
                "webchat:sequence-id": webchatSequenceId
            }
        }
    }
}

export default convertPersistentChatHistoryMessageToActivity