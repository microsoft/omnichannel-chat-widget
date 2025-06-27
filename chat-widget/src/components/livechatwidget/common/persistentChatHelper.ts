import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { isPersistentChatEnabled } from "./liveChatConfigUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shouldSetPreChatIfPersistentChat = async (facadeChatSDK: FacadeChatSDK, conversationMode: string, showPreChat: boolean) => {
    const persistentEnabled = isPersistentChatEnabled(conversationMode);
    let skipPreChat = false;
    
    if (persistentEnabled) {
        // Access private properties using type assertions
        const chatSDK = facadeChatSDK.getChatSDK();
        
        // Use type assertion to bypass private access restriction
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sdkAsAny = chatSDK as any;
        // most likely this is not set , the facade will take care of it
        const reconnectableChatsParams = {
            authenticatedUserToken: sdkAsAny.authenticatedUserToken as string,
            requestId: sdkAsAny.requestId as string,
        };

        try {
            const reconnectableChatsResponse = await facadeChatSDK.getReconnectableChats(reconnectableChatsParams);
            if (reconnectableChatsResponse && reconnectableChatsResponse.reconnectid) { // Skip rendering prechat on existing persistent chat session
                skipPreChat = true;
            }
        } catch {
            // eslint-disable-line no-empty
        }
    }

    return showPreChat && !skipPreChat;
};