import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { MessagePayload, TrackingMessage } from "./Constants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { createTrackingMessage } from "./util";

// This tracker is event based, this is since we are tracking events coming from different sources
//  with different timeline, therefore this is a functional approach to track the events, instead of a class based approach
export const createTrackingForFirstMessage = () => {
    // Reset the tracking variables
    let startTracking = false;
    let stopTracking = false;
    let startTime = 0;
    let stopTime = 0;
    let stopTrackingMessage: TrackingMessage;
    let flag = false;

    const isMessageFromValidSender = (payload: MessagePayload): boolean => {
        // agent scenario
        if (payload?.tags?.includes("public")) {
            return false;
        }
        return true;
    };

    const widgetLoadListener = BroadcastService.getMessageByEventName(TelemetryEvent.WidgetLoadComplete).subscribe(() => {
        if (startTracking) return;
        startTracking = true;
        startTime = new Date().getTime();
    }
    );

    const newMessageListener = BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageReceived).subscribe((message) => {
        const payload = message.payload as MessagePayload;

        // we only care for bot, so we need to check if the message is from the bot
        // pending to add typing message indicator signal detection

        if (isMessageFromValidSender(payload)) {
            if (startTracking && !stopTracking) {
                stopTime = new Date().getTime();
                const elapsedTime = stopTime - startTime;
                stopTracking = true;
                stopTrackingMessage = createTrackingMessage(payload, "botMessage");
                notifyFMLTrackingCompleted();
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.BotFirstMessageLapTrack,
                    Description: "First Message from Bot latency tracking",
                    CustomProperties: {
                        elapsedTime,
                        widgetLoadedAt: startTime,
                        botMessage: stopTrackingMessage
                    }
                });
            }
        }

        // this track only first message, if coming from the bot or not
        // the only difference is that it logs only those from bot
        disconnectListener();
    }
    );

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

    const ackListener = () => {
        const listen = BroadcastService.getMessageByEventName(BroadcastEvent.FMLTrackingCompletedAck).subscribe(() => {
            flag = true;
            listen.unsubscribe();
        });
    };
    
    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    const rehydrateListener = BroadcastService.getMessageByEventName(TelemetryEvent.RehydrateMessageReceived).subscribe(() => {
        startTracking = false;
        stopTracking = false;
        disconnectListener();
    }
    );

    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    const historyListener = BroadcastService.getMessageByEventName(BroadcastEvent.HistoryMessageReceived).subscribe(() => {
        startTracking = false;
        stopTracking = false;
        disconnectListener();
    }
    );

    const offlineNetworkListener = BroadcastService.getMessageByEventName(TelemetryEvent.NetworkDisconnected).subscribe(() => {
        startTracking = false;
        stopTracking = false;
        disconnectListener();
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.BotFirstMessageLapTrackError,
            Description: "Tracker Stopped due to network disconnection",
        });
    }
    );

    // this is to ensure that we are not tracking messages that are not part of the current conversation
    const disconnectListener = () => {
        historyListener.unsubscribe();
        rehydrateListener.unsubscribe();
        newMessageListener.unsubscribe();
        widgetLoadListener.unsubscribe();
        offlineNetworkListener.unsubscribe();
    };
};