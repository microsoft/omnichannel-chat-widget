import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { useEffect, useState } from "react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
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
                            // The trigger activity renders the "Loading previous messages..." banner
                            // via LazyLoadActivity. We set webchat:sequence-id to 1 and timestamp
                            // to epoch+1ms so WebChat sorts this activity BEFORE all history messages
                            // (which have sequence-ids based on transcriptOriginalMessageId timestamps).
                            // Without these, WebChat places activities without a sequence-id at the
                            // end of the transcript, causing the banner to appear at the bottom and
                            // breaking the IntersectionObserver pagination trigger (the observer only
                            // fires on visibility transitions — if the element starts visible at the
                            // bottom, the initial fire is blocked by the paused state and never
                            // re-fires since there is no transition).
                            dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {
                                activity: {
                                    from: {
                                        role: "bot"
                                    },
                                    timestamp: new Date(1).toISOString(),
                                    type: "message",
                                    channelData: {
                                        tags: [Constants.persistentChatHistoryMessagePullTriggerTag],
                                        "webchat:sequence-id": 1
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