import { isPersistentChatEnabled } from "./liveChatConfigUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shouldSetPreChatIfPersistentChat = async (chatSDK: any, showPreChat: boolean) => {
    const persistentEnabled = await isPersistentChatEnabled(chatSDK);
    let skipPreChat = false;
    if (persistentEnabled) {
        const reconnectableChatsParams = {
            authenticatedUserToken: chatSDK.authenticatedUserToken as string
        };

        try {
            const reconnectableChatsResponse = await chatSDK.OCClient.getReconnectableChats(reconnectableChatsParams);
            if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) { // Skip rendering prechat on existing persistent chat session
                skipPreChat = true;
            }
        } catch {
            // eslint-disable-line no-empty
        }
    }

    return showPreChat && !skipPreChat;
};