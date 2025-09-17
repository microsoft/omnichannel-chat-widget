import ChatWidgetEvents from "./ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import conversationDividerActivity from "../../webchatcontainerstateful/common/activities/conversationDividerActivity";
import convertPersistentChatHistoryMessageToActivity from "../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

/**
 * The `PersistentConversationHandler` class is responsible for managing the retrieval and processing
 * of persistent conversation history in a chat widget. It provides methods to fetch messages from
 * a paginated conversation history, handle message ordering, and dispatch events to render messages
 * and conversation dividers in the chat interface.
 *
 * This class is designed to work with a paginated API for fetching chat history, where each page
 * of messages is retrieved using a `pageToken`. It ensures that messages are fetched in the correct
 * order and handles the insertion of dividers between different conversations.
 *
 * ## Static Properties:
 * - `chatSDK: any`: A placeholder for the chat SDK instance. This is expected to be set externally.
 * - `isLastPull: boolean`: A flag indicating whether the last page of the conversation history has been fetched.
 * - `pageSize: number`: The number of messages to fetch per page. Defaults to 4.
 * - `pageToken: string | null`: The token for fetching the next page of messages. Null indicates no further pages.
 * - `lastMessage: any`: Stores the last processed message to determine conversation boundaries.
 * - `count: number`: A counter to track the number of history pulls performed.
 *
 * ## Methods:
 * - `shouldPull(): boolean`:
 *   Determines whether additional pages of conversation history should be fetched.
 *   Returns `true` if the last page has not been fetched, otherwise `false`.
 *
 * - `fetchPersistentConversationHistory(options: { pageSize?: number; pageToken?: string | undefined }): Promise<any>`:
 *   Fetches a page of persistent conversation history using the provided options.
 *   - `options.pageSize`: The number of messages to fetch per page.
 *   - `options.pageToken`: The token for fetching the next page of messages.
 *   Returns a promise that resolves to the fetched conversation history.
 *
 * - `fetchHistoryMessages(): Promise<any[]>`:
 *   Fetches and processes a page of conversation history messages.
 *   - Prevents additional pulls if the last page has already been fetched.
 *   - Updates the `pageToken` and `isLastPull` properties based on the API response.
 *   Returns an array of messages from the fetched page.
 *
 * - `pullHistory(): Promise<void>`:
 *   Pulls and processes the conversation history messages, dispatching events to render them.
 *   - Fetches messages in descending order by timestamp.
 *   - Converts each message to an activity format and dispatches it as a custom event.
 *   - Inserts a conversation divider activity between messages from different conversations.
 *   - Updates the `lastMessage` property to track the last processed message.
 *
 * ## Usage:
 * This class is intended to be used in a chat widget to manage the display of persistent conversation history.
 * It ensures that messages are fetched, ordered, and rendered correctly, with appropriate dividers between
 * different conversations.
 *
 * ## Example:
 * ```typescript
 * // Check if history should be pulled
 * if (PersistentConversationHandler.shouldPull()) {
 *   await PersistentConversationHandler.pullHistory();
 * }
 * ```
 */
class PersistentConversationHandler {
    static isLastPull = false;
    static pageSize = 4;
    static pageToken: string | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static lastMessage: any = null;
    static count = 0;


    public static shouldPull(): boolean {
        return !PersistentConversationHandler.isLastPull;
    }

    public static reset() {
        console.log("LOPEZ :: Reset");
        PersistentConversationHandler.isLastPull = false;
        PersistentConversationHandler.pageToken = null;
        PersistentConversationHandler.lastMessage = null;
        PersistentConversationHandler.count = 0;
    }

    public static async fetchHistoryMessages(facadeChatSDK: FacadeChatSDK) {
        // Prevent additional pulls if the last pull was already made
        if (!PersistentConversationHandler.shouldPull()) {
            return [];
        }

        const options: { pageSize?: number; pageToken?: string | undefined } = {
            pageSize: PersistentConversationHandler.pageSize
        };

        options.pageToken = PersistentConversationHandler.pageToken || undefined;

        try {
            const response = await facadeChatSDK.fetchPersistentConversationHistory(options);

            const { chatMessages: messages, nextPageToken: pageToken } = response;

            PersistentConversationHandler.pageToken = pageToken || null;

            if (pageToken === null) {
                PersistentConversationHandler.isLastPull = true;
            }

            return messages;
        } catch (error) {
            console.error(error);

        }
        return [];
    }

    public static async pullHistory(facadeChatSDK: FacadeChatSDK) {

        const messages = await PersistentConversationHandler.fetchHistoryMessages(facadeChatSDK);

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

            dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity });

            if (dividerActivity) {
                dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity: dividerActivity });
                dividerActivity = null;
            }

            PersistentConversationHandler.lastMessage = activity;
        }

        PersistentConversationHandler.count += 1;
    }
}


export default PersistentConversationHandler;