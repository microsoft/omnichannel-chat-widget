import { isPersistentChatEnabled } from "./liveChatConfigUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shouldSetPreChatIfPersistentChat = async (facadeChatSDK: any, conversationMode: string, showPreChat: boolean) => {
    const persistentEnabled = await isPersistentChatEnabled(conversationMode);
    let skipPreChat = false;
    if (persistentEnabled) {
        const reconnectableChatsParams = {
            authenticatedUserToken: facadeChatSDK.getChatSDK().authenticatedUserToken as string,
            requestId: facadeChatSDK.getChatSDK().requestId as string,
        };

        try {
            const reconnectableChatsResponse = await facadeChatSDK.getChatSDK().OCClient.getReconnectableChats(reconnectableChatsParams);
            if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) { // Skip rendering prechat on existing persistent chat session
                skipPreChat = true;
            }
        } catch {
            // eslint-disable-line no-empty
        }
    }

    return showPreChat && !skipPreChat;
};