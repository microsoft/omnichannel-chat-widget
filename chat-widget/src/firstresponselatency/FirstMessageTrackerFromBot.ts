import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
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

    const isMessageFromValidSender = (payload: MessagePayload): boolean => {
        // agent scenario
        if (payload?.tags?.includes("public")) {
            console.log("LOPEZ: FirstMessageTrackerFromBot - isMessageFromValidSender - public tag detected, ignoring message", payload);
            return false;
        }
        console.log("LOPEZ: FirstMessageTrackerFromBot - isMessageFromValidSender - valid sender detected", payload);
        return true;
    };

    const widgetLoadListener = BroadcastService.getMessageByEventName("WidgetLoadComplete").subscribe(() => {
        console.log("LOPEZ: FirstMessageTrackerFromBot - WidgetLoadComplete - start tracking");
    
        if (startTracking) return;
        startTracking = true;
        startTime = new Date().getTime();
    }
    );

    
    const newMessageListener = BroadcastService.getMessageByEventName("NewMessageReceived").subscribe((message) => {
        console.log("LOPEZ: FirstMessageTrackerFromBot - NewMessageReceived - start tracking");
        const payload = message.payload as MessagePayload;

        // we only care for bot, so we need to check if the message is from the bot
        // pending to add typing message indicator signal detection

        if (isMessageFromValidSender(payload)) {
            if (startTracking && !stopTracking) {
                stopTime = new Date().getTime();
                const elapsedTime = stopTime - startTime;
                stopTracking = true;
                stopTrackingMessage = createTrackingMessage(payload, "botMessage");
                console.log("LOPEZ: FirstMessageTrackerFromBot - elapsedTime", elapsedTime, stopTrackingMessage);
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

    let flag = false;

    const notifyFMLTrackingCompleted = () => {
        console.log("LOPEZ: Notify FMLTrackingCompleted", flag);
        ackListener();

        // Retry sending until flag is true, but do not block the main thread
        const interval = setInterval(() => {
            if (flag) {
                console.log("LOPEZ: Notify FMLTrackingCompleted - ACK Received, stopping interval");
                clearInterval(interval);
            } else {
                console.log("LOPEZ: Notify - Retrying FMLTrackingCompleted");
                BroadcastService.postMessage({
                    eventName: "FMLTrackingCompleted",
                    payload: null
                });
            }
        }, 100);
       
    };

    const ackListener = () => {
        console.log("LOPEZ : ACK Listener started");
        const listen = BroadcastService.getMessageByEventName("FMLTrackingCompletedAck").subscribe(() => {
            console.log("LOPEZ : ACK Received");
            flag = true;
            listen.unsubscribe();
        });
    };
    
    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    const rehydrateListener = BroadcastService.getMessageByEventName("RehydrateMessageReceived").subscribe(() => {
        console.log("LOPEZ: FirstMessageTrackerFromBot - RehydrateMessageReceived - stop tracking");
        startTracking = false;
        stopTracking = false;
        disconnectListener();
    }
    );

    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    const historyListener = BroadcastService.getMessageByEventName("HistoryMessageReceived").subscribe(() => {
        console.log("LOPEZ: FirstMessageTrackerFromBot - HistoryMessageReceived - stop tracking");
        startTracking = false;
        stopTracking = false;
        disconnectListener();
    }
    );

    const offlineNetworkListener = BroadcastService.getMessageByEventName("NetworkDisconnected").subscribe(() => {
        console.log("LOPEZ: FirstMessageTrackerFromBot - NetworkDisconnected - stop tracking");
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
        console.log("LOPEZ: FirstMessageTrackerFromBot - disconnectListener - stop tracking");
        historyListener.unsubscribe();
        rehydrateListener.unsubscribe();
        newMessageListener.unsubscribe();
        widgetLoadListener.unsubscribe();
        offlineNetworkListener.unsubscribe();
    };

};
