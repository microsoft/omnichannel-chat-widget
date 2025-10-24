import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { MessagePayload, TrackingMessage } from "./Constants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { createTrackingMessage } from "./util";

// This tracker is event based, this is since we are tracking events coming from different sources
//  with different timeline, therefore this is a functional approach to track the events, instead of a class based approach
export const createTrackingForFirstMessage = () => {
    // Reset the tracking variables
    let isTracking = false;
    let startTime = 0;
    let stopTime = 0;
    let stopTrackingMessage: TrackingMessage | null = null;
    let flag = false;
    let trackingTimeoutId: ReturnType<typeof setTimeout> | undefined;

    /**
     * Checks if the message payload is from a valid sender (not an agent).
     * Returns false if the message is from an agent (tag 'public'), true otherwise.
     */
    const isMessageFromValidSender = (payload: MessagePayload): boolean => {
        if (payload?.tags?.includes("public")) {
            return false;
        }
        return true;
    };

    /**
     * Listener for widget load completion event.
     * Starts tracking the time for the first bot message after widget loads.
     * Sets a 5-second timeout to auto-reset if no bot message is received.
     */
    const widgetLoadListener = BroadcastService.getMessageByEventName(TelemetryEvent.StartChatComplete).subscribe(() => {
        if (isTracking) return;
        isTracking = true;
        startTime = new Date().getTime();
        // Start a 5-second timeout to auto-stop tracking if not stopped
        if (trackingTimeoutId) {
            clearTimeout(trackingTimeoutId);
        }
        trackingTimeoutId = setTimeout(() => {
            if (isTracking) {
                // Reset state and disengage, no telemetry or FMLTrackingCompleted
                isTracking = false;
                startTime = 0;
                stopTime = 0;
                stopTrackingMessage = null;
                trackingTimeoutId = undefined;
                disconnectListener();
            }
        }, 10000); //adding more time since it meassures from widget load complete till message received
    });

    /**
     * Listener for new bot message event.
     * If a valid bot message is received, stops tracking and logs telemetry.
     * If the message is invalid, resets and disengages listeners.
     */
    const newMessageListener = BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageReceived).subscribe((message) => {
        const payload = message.payload as MessagePayload;

        if (!isMessageFromValidSender(payload)) {
            // If not valid, stop everything and clean up
            isTracking = false;
            if (trackingTimeoutId) {
                clearTimeout(trackingTimeoutId);
                trackingTimeoutId = undefined;
            }
            disconnectListener();
            return;
        }

        if (isTracking) {
            isTracking = false;
            // Clear the timeout if it exists
            if (trackingTimeoutId) {
                clearTimeout(trackingTimeoutId);
                trackingTimeoutId = undefined;
            }

            stopTime = new Date().getTime();
            const elapsedTime = stopTime - startTime;
            stopTrackingMessage = createTrackingMessage(payload, "botMessage");
            notifyFMLTrackingCompleted();
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.BotFirstMessageLapTrack,
                Description: "First Message from Bot latency tracking",
                CustomProperties: {
                    elapsedTime,
                    widgetLoadedAt: startTime,
                    botMessage: stopTrackingMessage,
                    type: payload?.type
                }
            });
            disconnectListener();
        }
    });

    /**
     * Notifies that FML (First Message Latency) tracking is completed.
     * Retries sending the completion event until acknowledged.
     */
    const notifyFMLTrackingCompleted = () => {
        ackListener();
        // Retry sending until flag is true, but do not block the main thread
        const interval = setInterval(() => {
            if (flag) {
                clearInterval(interval);
            } else {
                BroadcastService.postMessage({
                    eventName: BroadcastEvent.FMLTrackingCompleted,
                    payload: null
                });
            }
        }, 100);
    };

    /**
     * Listener for FMLTrackingCompletedAck event.
     * Sets the flag to true when acknowledgment is received.
     */
    const ackListener = () => {
        const listen = BroadcastService.getMessageByEventName(BroadcastEvent.FMLTrackingCompletedAck).subscribe(() => {
            flag = true;
            listen.unsubscribe();
        });
    };
    
    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    /**
     * Listener for widget rehydration event.
     * Resets tracking and disconnects listeners when widget is reloaded.
     */
    const rehydrateListener = BroadcastService.getMessageByEventName(TelemetryEvent.RehydrateMessageReceived).subscribe(() => {
        isTracking = false;
        disconnectListener();
    });

    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    /**
     * Listener for history message event.
     * Resets tracking and disconnects listeners when history is loaded.
     */
    const historyListener = BroadcastService.getMessageByEventName(BroadcastEvent.HistoryMessageReceived).subscribe(() => {
        isTracking = false;
        disconnectListener();
    });

    /**
     * Listener for network disconnection event.
     * Resets tracking, disconnects listeners, and logs a telemetry error.
     */
    const offlineNetworkListener = BroadcastService.getMessageByEventName(TelemetryEvent.NetworkDisconnected).subscribe(() => {
        isTracking = false;
        disconnectListener();
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.BotFirstMessageLapTrackError,
            Description: "Tracker Stopped due to network disconnection",
        });
    });

    // this is to ensure that we are not tracking messages that are not part of the current conversation
    /**
     * Disconnects all listeners and clears the tracking timeout.
     * Used for cleanup when tracking is stopped or reset.
     */
    const disconnectListener = () => {
        if (trackingTimeoutId) {
            clearTimeout(trackingTimeoutId);
            trackingTimeoutId = undefined;
        }
        historyListener.unsubscribe();
        rehydrateListener.unsubscribe();
        newMessageListener.unsubscribe();
        widgetLoadListener.unsubscribe();
        offlineNetworkListener.unsubscribe();
    };
};