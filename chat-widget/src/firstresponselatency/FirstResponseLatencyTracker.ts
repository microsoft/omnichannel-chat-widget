import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
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


        console.log("LOPEZ :: FirstResponseLatencyTracker - startTracking", this.isReady);
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
    }

    private handleAgentMessage(payload: MessagePayload): void {
        // this tag so far is only present in agent messages
        if (payload?.tags?.includes("public")) {
            this.deregister();
        }
    }

    private stopTracking(payload: MessagePayload): void {
        // this prevents execution for multiple incoming messages from the bot.
        if (this.isEnded && !this.isStarted) {
            return;
        }

        // control of states to prevent clashing of messages
        this.isEnded = true;
        this.isStarted = false;

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
            // in the case of a reload, tracker will be paused, until last history message is received
            // this is because we dont have a way to identidy send messages as part of the history
            //if (this.inPause) return;
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
    
    private offlineNetworkListener = BroadcastService.getMessageByEventName("NetworkDisconnected").subscribe(() => {
        this.deregister();
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.MessageStopLapTrackError,
            Description: "Tracker Stopped due to network disconnection",
        });
    }
    );

    private fmltrackingListener = BroadcastService.getMessageByEventName("FMLTrackingCompleted").subscribe(() => {
        console.log("LOPEZ :: FMLTrackingCompleted event received");
        this.isReady = true;
        BroadcastService.postMessage({
            eventName: "FMLTrackingCompletedAck",
            payload: null
        });
    }
    );


    private deregister(): void {
        // Reset State
        this.isABotConversation = false;
        this.isStarted = false;
        this.isEnded = false;
        this.startTrackingMessage = undefined;
        this.stopTrackingMessage = undefined;
        this.offlineNetworkListener.unsubscribe();
        this.fmltrackingListener.unsubscribe();
    }
}