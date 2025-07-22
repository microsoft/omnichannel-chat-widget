import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { MessagePayload, TrackingMessage } from "./Constants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";

export class FirstResponseLatencyTracker {

    private isABotConversation = false;
    private isStarted = false;
    private isEnded = false;
    private startTrackingMessage?: TrackingMessage;
    private stopTrackingMessage?: TrackingMessage;
    private isReady = false;
    private trackingTimeoutId?: ReturnType<typeof setTimeout>;

    constructor() {
        // this is a workaround to ensure in reload we track effectively the messages
        // we do have a mechanism in place to prevent log agent messages.
        this.isABotConversation = true;
    }

    private createTrackingMessage(payload: MessagePayload, type: string): TrackingMessage {
        return {
            Id: payload.Id,
            role: payload.role,
            timestamp: payload?.timestamp,
            tags: payload.tags,
            messageType: payload.messageType,
            text: payload.text,
            type: type,
            checkTime: new Date().getTime()
        };
    }

    // Tracking Functions
    private startTracking(payload: MessagePayload): void {

        console.log("[FMB DEBUG] Tracking started", payload);

        if (!this.isReady) return;
        //  this prevents to initiate tracking for multiple incoming messages
        if (this.isStarted) {
            return;
        }
        // this is to ensure we track only messages where bot is engaged
        if (!this.isABotConversation) {
            return;
        }
        // control of states to prevent clashing of messages
        this.isStarted = true;
        this.isEnded = false;
        // The idea  of using types is to enrich telemetry data 
        this.startTrackingMessage = this.createTrackingMessage(payload, "userMessage");

        // Start a 5-second timeout to auto-stop tracking if not stopped
        if (this.trackingTimeoutId) {
            clearTimeout(this.trackingTimeoutId);
        }
        this.trackingTimeoutId = setTimeout(() => {
            if (this.isStarted && !this.isEnded) {
                // Create a default message for timeout with all required properties
                const defaultPayload: MessagePayload = {
                    Id: payload.Id + "_timeout",
                    role: "system",
                    timestamp: new Date().toISOString(),
                    tags: ["timeout"],
                    messageType: "timeout",
                    text: "First response latency tracking timed out.",
                    type: "timeout",
                    userId: payload.userId || "system",
                    isChatComplete: false
                };
                // Mark as stopped by timeout
                this.stopTracking(defaultPayload);
            }
        }, 5000);
    }

    private handleAgentMessage(payload: MessagePayload): void {
        // this tag so far is only present in agent messages
        if (payload?.tags?.includes("public")) {
            this.deregister();
        }
    }

    private stopTracking(payload: MessagePayload): void {
        console.log("[FMB DEBUG] Tracking stopped", payload);
        // this prevents execution for multiple incoming messages from the bot.
        if (this.isEnded && !this.isStarted) {
            return;
        }

        // control of states to prevent clashing of messages
        this.isEnded = true;
        this.isStarted = false;

        // Clear the timeout if it exists
        if (this.trackingTimeoutId) {
            clearTimeout(this.trackingTimeoutId);
            this.trackingTimeoutId = undefined;
        }

        // The idea  of using types is to enrich telemetry data 
        this.stopTrackingMessage = this.createTrackingMessage(payload, "botMessage");
        // calculating elapsed time
        const elapsedTime = (this.stopTrackingMessage?.checkTime ?? 0) - (this.startTrackingMessage?.checkTime ?? 0);
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.MessageLapTrack,
            Description: "First response latency tracking",
            CustomProperties: {
                elapsedTime,
                userMessage: this.startTrackingMessage,
                botMessage: this.stopTrackingMessage
            }
        });
    }

    // mechanism to ensure we track only allowed conversations
    private isMessageFromValidSender(payload: MessagePayload): boolean {
        // agent scenario
        if (payload?.tags?.includes("public")) {
            this.handleAgentMessage(payload);
            return false;
        }
        return true;
    }

    public startClock(payload: MessagePayload): void {
        try {
            if (!payload || !payload.Id) {
                throw new Error("Invalid payload");
            }
            console.log("[FRL DEBUG] startClock called", payload);
            this.startTracking(payload);
        } catch (e) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.MessageStartLapTrackError,
                Description: "Error while starting the clock",
                ExceptionDetails: e,
                CustomProperties: {
                    payload: payload
                }
            });
        }
    }

    public stopClock(payload: MessagePayload): void {
        try {

            if (!payload || !payload.Id) {
                throw new Error("Invalid payload");
            }

            if (!this.isMessageFromValidSender(payload)) return;

            if (this.isABotConversation && this.isStarted) {
                console.log("[FRL DEBUG] stopClock called", payload);
                this.stopTracking(payload);
            }
        } catch (e) {
            console.error("FRL : error while trying to stop the tracker", e);
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.MessageStopLapTrackError,
                Description: "Error while stopping the clock",
                ExceptionDetails: e,
                CustomProperties: {
                    payload: payload
                }
            });
            //reset state
            this.startTrackingMessage = undefined;
            this.stopTrackingMessage = undefined;
            this.isStarted = false;
            this.isEnded = false;
        }
    }

    private offlineNetworkListener = BroadcastService.getMessageByEventName(TelemetryEvent.NetworkDisconnected).subscribe(() => {
        this.isStarted = false;
        this.isEnded = false;
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.MessageStopLapTrackError,
            Description: "Tracker Stopped due to network disconnection",
        });
    }
    );

    private fmltrackingListener = BroadcastService.getMessageByEventName(BroadcastEvent.FMLTrackingCompleted).subscribe(() => {
        this.isReady = true;
        BroadcastService.postMessage({
            eventName: BroadcastEvent.FMLTrackingCompletedAck,
            payload: null
        });
    }
    );
    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    private rehydrateListener = BroadcastService.getMessageByEventName(TelemetryEvent.RehydrateMessageReceived).subscribe(() => {
        this.isReady = true;
    }
    );

    // Rehydrate message is received when the widget is reloaded, this is to ensure that we are not tracking messages that are not part of the current conversation
    // No need to keep listerning for tracking, enforcing disconnection for the listners
    private historyListener = BroadcastService.getMessageByEventName(BroadcastEvent.HistoryMessageReceived).subscribe(() => {
        this.isReady = true;
    }
    );

    private deregister(): void {
        // Reset State
        this.isABotConversation = false;
        this.isStarted = false;
        this.isEnded = false;
        this.startTrackingMessage = undefined;
        this.stopTrackingMessage = undefined;
        if (this.trackingTimeoutId) {
            clearTimeout(this.trackingTimeoutId);
            this.trackingTimeoutId = undefined;
        }
        this.offlineNetworkListener.unsubscribe();
        this.fmltrackingListener.unsubscribe();
        this.rehydrateListener.unsubscribe();
        this.historyListener.unsubscribe();
    }
}