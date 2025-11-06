import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { useEffect, useRef } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import PersistentConversationHandler from "../../livechatwidget/common/PersistentConversationHandler";
import SecureEventBus from "../../../common/utils/SecureEventBus";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

const usePersistentChatHistory = (facadeChatSDK: FacadeChatSDK | undefined, props : IPersistentChatHistoryProps) => {
    const handlerRef = useRef<PersistentConversationHandler | null>(null);

    useEffect(() => {
        if (!facadeChatSDK) {
            return;
        }

        TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.UXLCWPersistentChatHistoryInitialized,
            Description: "Persistent chat history hook initialized"
        });

        handlerRef.current = new PersistentConversationHandler(facadeChatSDK, props);

        const handler = async () => {
            TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                Event: TelemetryEvent.LCWPersistentChatHistoryFetchStarted,
                Description: "Persistent chat history fetch started"
            });
            
            try {
                await handlerRef.current?.pullHistory();
                
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.LCWPersistentChatHistoryFetchCompleted,
                    Description: "Persistent chat history fetch completed successfully"
                });
            } catch (error) {
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.ERROR, {
                    Event: TelemetryEvent.LCWPersistentChatHistoryFetchFailed,
                    Description: "Persistent chat history fetch failed",
                    ExceptionDetails: error
                });
            }
        };

        // Subscribe to the secure event bus instead of global window events
        const eventBus = SecureEventBus.getInstance();
        const unsubscribe = eventBus.subscribe(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY, handler);

        return () => {
            unsubscribe();
            handlerRef.current?.destroy(); // Call destroy instead of reset to properly clean up
        };
    }, [facadeChatSDK]);
};

export default usePersistentChatHistory;