import { useEffect, useRef } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import PersistentConversationHandler from "../../livechatwidget/common/PersistentConversationHandler";

const usePersistentChatHistory = (facadeChatSDK: FacadeChatSDK | undefined) => {
    const isListenerAdded = useRef(false);

    useEffect(() => {
        const handler = async () => {
            if (facadeChatSDK) {
                await PersistentConversationHandler.pullHistory(facadeChatSDK);
            }
        };

        window.addEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);
        isListenerAdded.current = true;

        return () => {
            window.removeEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);
            isListenerAdded.current = false;

        };
    }, [facadeChatSDK]);
};

export default usePersistentChatHistory;