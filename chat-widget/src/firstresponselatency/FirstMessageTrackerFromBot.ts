import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { MessagePayload, TrackingMessage } from "./Constants";
import { createTrackingMessage } from "./util";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";


// This tracker is event based, this is since we are tracking events coming from different sources
//  with different timeline, therefore this is a functional approach to track the events, instead of a class based approach
export const createTrackingForFirstMessage = () => {
    
    // Reset the tracking variables
    let startTracking = false;
    let stopTracking = false;
    let startTime = 0;
    let stopTime = 0;
    let stopTrackingMessage: TrackingMessage;

    const widgetLoadListener = BroadcastService.getMessageByEventName("WidgetLoadComplete").subscribe(() => {
    
        if (startTracking) return;
        startTracking = true;
        startTime = new Date().getTime();
    }
    );

    const newMessageListener = BroadcastService.getMessageByEventName("NewMessageReceived").subscribe((message) => {
        const payload = message.payload as MessagePayload;

        // we only care for bot, so we need to check if the message is from the bot
        // pending to add typing message indicator signal detection
        if (payload.role === "bot") {
            if (startTracking && !stopTracking) {
                stopTime = new Date().getTime();
                const elapsedTime = stopTime - startTime;
                stopTracking = true;
                stopTrackingMessage = createTrackingMessage(payload, "botMessage");

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

    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    const rehydrateListener = BroadcastService.getMessageByEventName("RehydrateMessageReceived").subscribe(() => {
        startTracking = false;
        stopTracking = false;
        disconnectListener();
    }
    );

    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    const historyListener = BroadcastService.getMessageByEventName("HistoryMessageReceived").subscribe(() => {
        startTracking = false;
        stopTracking = false;
        disconnectListener();
    }
    );

    const disconnectListener = () => {
        historyListener.unsubscribe();
        rehydrateListener.unsubscribe();
        newMessageListener.unsubscribe();
        widgetLoadListener.unsubscribe();
    };

};
