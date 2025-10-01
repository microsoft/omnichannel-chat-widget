import { useEffect, useState } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import { WebChatStoreLoader } from "./WebChatStoreLoader";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

/**
 * Component to handle persistent chat history events.
 * Uses WebChatStoreLoader instead of hooks to avoid context issues.
 */
const WebChatEventSubscribers = (props: IPersistentChatHistoryProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const [storeReady, setStoreReady] = useState(false);

    useEffect(() => {

        if (!props.persistentChatHistoryEnabled) {
            return;
        }

        // Wait for WebChat store to be available
        const waitForStore = () => {
            if (WebChatStoreLoader.store) {
                setStoreReady(true);
                return true;
            }
            return false;
        };

        // Check if store is already available
        if (!waitForStore()) {
            // Poll for store availability
            const storeCheckInterval = setInterval(() => {
                if (waitForStore()) {
                    clearInterval(storeCheckInterval);
                }
            }, 100);

            return () => {
                clearInterval(storeCheckInterval);
            };
        }

    }, [props.persistentChatHistoryEnabled]);

    useEffect(() => {

        if (!props.persistentChatHistoryEnabled || !storeReady) {
            return;
        }

        const checkConnectionStatus = () => {
            try {
                if (WebChatStoreLoader.store) {
                    const state = WebChatStoreLoader.store.getState();
                    const connectivityStatus = state?.connectivityStatus;
                    const newIsConnected = connectivityStatus === "connected";

                    if (newIsConnected && !isConnected) {
                        setIsConnected(true);
                        // Dispatch events when connection is established
                        setTimeout(() => {
                            dispatchCustomEvent(ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
                            dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {
                                activity: {
                                    from: {
                                        role: "bot"
                                    },
                                    timestamp: 0,
                                    type: "message",
                                    channelData: {
                                        tags: [Constants.persistentChatHistoryMessagePullTriggerTag]
                                    }
                                }
                            });
                        }, 2000);
                    } else if (!newIsConnected && isConnected) {
                        setIsConnected(false);
                    }
                }
            } catch (error) {
                console.error("[WebChatEventSubscribers] Connection status check failed:", error);
            }
        };

        // Check immediately
        checkConnectionStatus();

        // Set up interval to check connection status
        const interval = setInterval(checkConnectionStatus, 1000); // Check every 5 seconds instead of 1

        return () => {
            clearInterval(interval);
        };
    }, [isConnected, props.persistentChatHistoryEnabled, storeReady]);

    return null;
};

export default WebChatEventSubscribers;