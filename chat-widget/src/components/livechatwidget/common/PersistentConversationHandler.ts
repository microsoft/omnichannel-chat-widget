import ChatWidgetEvents from "./ChatWidgetEvents";
import conversationSeparatorActivity from "../../webchatcontainerstateful/common/activities/conversationSeparatorActivity";
import convertPersistentChatHistoryMessageToActivity from "../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";
import fetchPersistentConversationHistory from "./fetchPersistentConversationHistory";

class PersistentConversationHandler {
    static chatSDK: any;
    static isLastPull: boolean = false;
    static pageSize: number = 4;
    static pageToken: string | null = null;
    static lastMessage: any = null;
    static count: number = 0;

    public static shouldPull(): boolean {
        return !PersistentConversationHandler.isLastPull;
    }

    public static async fetchPersistentConversationHistory(options: { pageSize?: number; pageToken?: string | null }) {
        return fetchPersistentConversationHistory(options);
    }

    public static async fetchHistoryMessages() {
        // Prevent additional pulls if the last pull was already made
        if (!PersistentConversationHandler.shouldPull()) {
            return [];
        }
        
        const options: { pageSize?: number; pageToken?: string | null } = {
            pageSize: PersistentConversationHandler.pageSize
        };

        if (PersistentConversationHandler.pageToken) {
            options.pageToken = PersistentConversationHandler.pageToken;
        }
    
        const response = await PersistentConversationHandler.fetchPersistentConversationHistory(options);
        const {chatMessages: messages, nextPageToken: pageToken} = response;

        PersistentConversationHandler.pageToken = pageToken || null;
    
        // 'pageToken' is null on the last pull
        if (pageToken === null) {
            PersistentConversationHandler.isLastPull = true;
        }
        
        return messages;
    }

    public static async pullHistory() {
        const messages = await PersistentConversationHandler.fetchHistoryMessages();

        // Reorder messages in descending order by timestamp
        const messagesDescOrder = [...messages];
        messagesDescOrder.reverse();

        for (const message of messagesDescOrder) {
            let separatorActivity = null;
            let activity = convertPersistentChatHistoryMessageToActivity(message);

            if (activity?.channelData) {
                const sequenceId = activity.channelData['webchat:sequence-id'];
                activity = {
                    ...activity,
                    channelData: {
                        ...activity.channelData,
                        'webchat:sequence-id': sequenceId,
                        count: PersistentConversationHandler.count
                    }
                }
            }
        
            // Render separator between history messages and current conversation messages
            if (PersistentConversationHandler.lastMessage === null) {
                const sequenceId = activity.channelData['webchat:sequence-id'] + 1;
                const timestamp = new Date(activity.timestamp).getTime() + 1;
                separatorActivity = {
                    ...conversationSeparatorActivity,
                    channelData: {
                        ...conversationSeparatorActivity.channelData,
                        conversationId: activity.channelData.conversationId,
                        'webchat:sequence-id': sequenceId
                    },        
                    timestamp: new Date(timestamp).toISOString()
                };
            }

            // Render separator between different conversations
            if (PersistentConversationHandler.lastMessage && PersistentConversationHandler.lastMessage.channelData?.conversationId && PersistentConversationHandler.lastMessage.channelData?.conversationId !== activity.channelData.conversationId) {
                const sequenceId = activity.channelData['webchat:sequence-id'] + 1;
                const timestamp = new Date(activity.timestamp).getTime() + 1;
                separatorActivity = {
                    ...conversationSeparatorActivity,
                    channelData: {
                        ...conversationSeparatorActivity.channelData,
                        conversationId: activity.channelData.conversationId,
                        'webchat:sequence-id': sequenceId
                    },
                    timestamp: new Date(timestamp).toISOString(),
                };
            }
        
            dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {activity});

            if (separatorActivity) {
                dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {activity: separatorActivity});
                separatorActivity = null;
            }

            PersistentConversationHandler.lastMessage = activity;
        }

        PersistentConversationHandler.count += 1;
    }
}

export default PersistentConversationHandler;