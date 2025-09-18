import { useEffect, useRef } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import PersistentConversationHandler from "../../livechatwidget/common/PersistentConversationHandler";

const usePersistentChatHistory = (facadeChatSDK: FacadeChatSDK | undefined) => {
    const handlerRef = useRef<PersistentConversationHandler | null>(null);

    useEffect(() => {
        if (!facadeChatSDK) {
            return;
        }

        // Initialize a new instance of PersistentConversationHandler
        handlerRef.current = new PersistentConversationHandler(facadeChatSDK);

        const handler = async () => {
            await handlerRef.current?.pullHistory();
        };

        window.addEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);

        return () => {
            window.removeEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);
            handlerRef.current?.reset(); // Reset the handler state on cleanup
        };
    }, [facadeChatSDK]);
};

export default usePersistentChatHistory;