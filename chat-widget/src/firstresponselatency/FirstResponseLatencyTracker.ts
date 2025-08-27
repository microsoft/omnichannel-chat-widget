import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { MessagePayload, TrackingMessage } from "./Constants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";

export class FirstResponseLatencyTracker {

    private isABotConversation = false;
    private isTracking = false;
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

        if (!this.isReady) return;
        //  this prevents to initiate tracking for multiple incoming messages
        if (this.isTracking) {
            return;
        }
        // this is to ensure we track only messages where bot is engaged
        if (!this.isABotConversation) {
            return;
        }
        // control of states to prevent clashing of messages
        this.isTracking = true;
        // The idea  of using types is to enrich telemetry data 
        this.startTrackingMessage = this.createTrackingMessage(payload, "userMessage");

        // Start a 5-second timeout to auto-stop tracking if not stopped
        if (this.trackingTimeoutId) {
            clearTimeout(this.trackingTimeoutId);
        }
        this.trackingTimeoutId = setTimeout(() => {
            // this means the start process is in progress, but the end wasn't called within the time limit
            if (this.isTracking) {
                // Reset state variables and skip stopTracking
                this.isTracking = false;
                this.startTrackingMessage = undefined;
                this.stopTrackingMessage = undefined;
                this.trackingTimeoutId = undefined;
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
        // this prevents execution for multiple incoming messages from the bot.
        if (!this.isTracking) {
            return;
        }
        // Clear the timeout if it exists
        if (this.trackingTimeoutId) {
            clearTimeout(this.trackingTimeoutId);
            this.trackingTimeoutId = undefined;
        }
        // control of states to prevent clashing of messages
        this.isTracking = false;

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

            // Only allow stopTracking if sender is valid and tracking is active
            if (!this.isMessageFromValidSender(payload)) {
                // Do not change isTracking or stopTrackingMessage
                return;
            }

            if (this.isABotConversation && this.isTracking) {
                this.stopTracking(payload);
            }
        } catch (e) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.MessageStopLapTrackError,
                Description: "Error while stopping the clock",
                ExceptionDetails: e,
                CustomProperties: {
                    payload: payload
                }
            });
        }
    }

    private offlineNetworkListener = BroadcastService.getMessageByEventName(TelemetryEvent.NetworkDisconnected).subscribe(() => {
        this.isTracking = false;
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
        this.isTracking = false;
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