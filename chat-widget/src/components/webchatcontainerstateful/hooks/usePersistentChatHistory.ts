import { useEffect, useRef } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import PersistentConversationHandler from "../../livechatwidget/common/PersistentConversationHandler";

const usePersistentChatHistory = (facadeChatSDK: FacadeChatSDK | undefined, props : IPersistentChatHistoryProps) => {
    const handlerRef = useRef<PersistentConversationHandler | null>(null);

    useEffect(() => {
        if (!facadeChatSDK) {
            return;
        }

        handlerRef.current = new PersistentConversationHandler(facadeChatSDK, props);

        const handler = async () => {
            await handlerRef.current?.pullHistory();
        };

        window.addEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);

        return () => {
            window.removeEventListener(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);
            handlerRef.current?.destroy(); // Call destroy instead of reset to properly clean up
        };
    }, [facadeChatSDK]);
};

export default usePersistentChatHistory;