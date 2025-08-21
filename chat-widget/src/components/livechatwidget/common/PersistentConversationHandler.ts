import ChatWidgetEvents from "./ChatWidgetEvents";
import conversationDividerActivity from "../../webchatcontainerstateful/common/activities/conversationDividerActivity";
import convertPersistentChatHistoryMessageToActivity from "../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";
import fetchPersistentConversationHistory from "./fetchPersistentConversationHistory";

class PersistentConversationHandler {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static chatSDK: any;
    static isLastPull = false;
    static pageSize = 4;
    static pageToken: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static lastMessage: any = null;
    static count = 0;

    public static shouldPull(): boolean {
        return !PersistentConversationHandler.isLastPull;
    }

    public static async fetchPersistentConversationHistory(options: { pageSize?: number; pageToken?: string | undefined }) {
        return fetchPersistentConversationHistory(options);
    }

    public static async fetchHistoryMessages() {
        // Prevent additional pulls if the last pull was already made
        if (!PersistentConversationHandler.shouldPull()) {
            return [];
        }
        
        const options: { pageSize?: number; pageToken?: string | undefined } = {
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
            let dividerActivity = null;
            let activity = convertPersistentChatHistoryMessageToActivity(message);

            if (activity?.channelData) {
                const sequenceId = activity.channelData["webchat:sequence-id"];
                activity = {
                    ...activity,
                    channelData: {
                        ...activity.channelData,
                        "webchat:sequence-id": sequenceId,
                        count: PersistentConversationHandler.count
                    }
                };
            }
        
            // Render separator between different conversations
            if (PersistentConversationHandler.lastMessage?.channelData?.conversationId !== activity.channelData.conversationId) {
                const sequenceId = activity.channelData["webchat:sequence-id"] + 1;
                const timestamp = new Date(activity.timestamp).getTime() + 1;
                dividerActivity = {
                    ...conversationDividerActivity,
                    channelData: {
                        ...conversationDividerActivity.channelData,
                        conversationId: activity.channelData.conversationId,
                        "webchat:sequence-id": sequenceId
                    },
                    timestamp: new Date(timestamp).toISOString(),
                };
            }
        
            dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {activity});

            if (dividerActivity) {
                dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {activity: dividerActivity});
                dividerActivity = null;
            }

            PersistentConversationHandler.lastMessage = activity;
        }

        PersistentConversationHandler.count += 1;
    }
}

export default PersistentConversationHandler;