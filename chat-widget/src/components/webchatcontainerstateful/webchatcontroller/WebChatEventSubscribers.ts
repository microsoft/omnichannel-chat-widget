import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { useEffect, useState } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "./WebChatStoreLoader";
import { createTimer } from "../../../common/utils";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

/**
 * Component to handle persistent chat history events.
 * Uses WebChatStoreLoader instead of hooks to avoid context issues.
 */
const WebChatEventSubscribers = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [storeReady, setStoreReady] = useState(false);
    const storeWaitTimer = createTimer();
    // Type the chatConfig properly to avoid 'any' usage
    
    useEffect(() => {

        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
            Event: TelemetryEvent.LCWWebChatStorePollingStarted,
            Description: "WebChat store polling started"
        });

        // Wait for WebChat store to be available
        const waitForStore = () => {
            if (WebChatStoreLoader.store) {
                setStoreReady(true);
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.LCWWebChatStoreReady,
                    Description: "WebChat store ready",
                    ElapsedTimeInMilliseconds: storeWaitTimer.milliSecondsElapsed
                });
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

    }, []);

    useEffect(() => {

        if (!storeReady) {
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
                        
                        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.INFO, {
                            Event: TelemetryEvent.LCWWebChatConnected,
                            Description: "WebChat connection established, dispatching events"
                        });
                        
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
                        TelemetryHelper.logActionEventToAllTelemetry(LogLevel.WARN, {
                            Event: TelemetryEvent.LCWWebChatDisconnected,
                            Description: "WebChat connection lost"
                        });
                    }
                }
            } catch (error) {
                TelemetryHelper.logActionEventToAllTelemetry(LogLevel.ERROR, {
                    Event: TelemetryEvent.LCWWebChatConnectionCheckFailed,
                    Description: "WebChat connection status check failed",
                    ExceptionDetails: error
                });
            }
        };

        // Check immediately
        checkConnectionStatus();

        // Set up interval to check connection status
        const interval = setInterval(checkConnectionStatus, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [isConnected, storeReady]);

    return null;
};

export default WebChatEventSubscribers;