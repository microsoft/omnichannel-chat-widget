import { useEffect, useRef } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import PersistentConversationHandler from "../../livechatwidget/common/PersistentConversationHandler";

const usePersistentChatHistory = (facadeChatSDK: FacadeChatSDK | undefined, props: IPersistentChatHistoryProps) => {
    // Reference to the PersistentConversationHandler instance
    const handlerRef = useRef<PersistentConversationHandler | null>(null);

    useEffect(() => {
        if (!facadeChatSDK) {
            return; // Exit if the SDK is not available
        }

        // Initialize a new instance of PersistentConversationHandler
        handlerRef.current = new PersistentConversationHandler(facadeChatSDK, props);

        // Event handler for fetching persistent chat history
        const handler = async () => {
            await handlerRef.current?.pullHistory(); // Trigger history pull
        };

        // Add event listener for FETCH_PERSISTENT_CHAT_HISTORY
        window.addEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);

        return () => {
            // Remove event listener on cleanup
            window.removeEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);

            // Reset the handler state on cleanup
            handlerRef.current?.reset();
        };
    }, [facadeChatSDK]); // Re-run effect if facadeChatSDK changes
};

export default usePersistentChatHistory;