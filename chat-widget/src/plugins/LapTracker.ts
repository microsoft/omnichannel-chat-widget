import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Subscription } from "rxjs";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";

type MessagePayload = {
    id: string;
    role: string;
    timestamp: string;
    tags: string[];
    messageType: string;
    text: string;
};


type TrackingMessage = {

    id: string;
    role: string;
    timestamp: string;
    tags: string[];
    messageType: string;
    text: string;
    checkTime?: number;
    type: string;
}



class LapTracker {
    private isABotConversation = false;
    private isStarted = false;
    private isEnded = false;
    private firstMessageReceived = false;

    private sb1?: Subscription;
    private sb2?: Subscription;
    private sb3?: Subscription;
    private startTrackingMessage?: TrackingMessage;
    private stopTrackingMessage?: TrackingMessage;

    constructor() {
        //this.loadStateFromLocalStorage();
    }

    private createTrackingMessage(payload: MessagePayload, type: string): TrackingMessage {
        return {
            id: payload.id,
            role: payload.role,
            timestamp: payload.timestamp,
            tags: payload.tags,
            messageType: payload.messageType,
            text: payload.text,
            type: type,
            checkTime: new Date().getTime()
        };
    }
    // Utility Functions
    /*private loadStateFromLocalStorage(): void {
        const storedConversationState = localStorage?.getItem("conversationState");
        if (storedConversationState) {
            const parsedState = JSON.parse(storedConversationState);
            this.isABotConversation = parsedState.isABotConversation;
            this.firstMessageReceived = parsedState.firstMessageReceived;
        }
    }*/

    private saveStateToLocalStorage(): void {
        const conversationState = {
            isABotConversation: this.isABotConversation,
            firstMessageReceived: this.firstMessageReceived,
        };
        localStorage?.setItem("conversationState", JSON.stringify(conversationState));
        console.log("LOPEZ :: LapTracker saved state: ", conversationState);
    }

    // Tracking Functions
    private startTracking(payload: MessagePayload): void {
        if (this.isStarted) {
            console.log("LOPEZ :: LapTracker already started, ignoring startTracking call");
            return;
        }

        console.log("LOPEZ :: LapTracker :: startTracking: ", this.isStarted, this.isEnded);
        this.isStarted = true;
        this.isEnded = false;
        this.startTrackingMessage = this.createTrackingMessage(payload, "userMessage");
        console.log("LOPEZ :: LapTracker started at: ", this.startTrackingMessage);
    }

    private stopTracking(payload: MessagePayload): void {
        if (this.isEnded) {
            console.log("LOPEZ :: LapTracker already ended, ignoring stopTracking call");
            return;
        }
        this.isEnded = true;
        this.isStarted = false;

        this.stopTrackingMessage = this.createTrackingMessage(payload, "botMessage");


        const elapsedTime = (this.startTrackingMessage?.checkTime ?? 0) - (this.stopTrackingMessage?.checkTime ?? 0);

        console.log("LOPEZ ::LapTracker stopped at: ", this.stopTrackingMessage, elapsedTime);

        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.MessageLapTrack,
            Description: "New message received",
            Data: {
                elapsedTime: elapsedTime,
                userMessage: this.startTrackingMessage,
                botMessage: this.stopTrackingMessage

            }
        });
    }

    // Public Methods
    public register(): void {
        console.log("LOPEZ :: LapTracker registered");

        this.sb1 = BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageReceived).subscribe(async (msg) => {
            const { payload } = msg;
            console.log("LOPEZ :: NewMessageReceived:: LapTracker event received: ", payload);

            if (!this.firstMessageReceived) {
                this.firstMessageReceived = true;
                if (payload?.role === "bot") {
                    this.isABotConversation = true;
                    this.saveStateToLocalStorage();
                    console.log("LOPEZ :: NewMessageReceived ::: First message from bot: ", msg, this.isABotConversation, this.isStarted);
                    return;
                }
            }

            if (this.isABotConversation && this.isStarted) {
                console.log("LOPEZ :: LapTracker :: NewMessageReceived :: stopTracking: ", msg);
                this.stopTracking(payload);
            }
        });

        this.sb2 = BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageSent).subscribe(async (msg) => {
            console.log("LOPEZ :: NewMessageSent:: LapTracker event received: ", msg);
            const { payload } = msg;

            if (this.isABotConversation && !this.isStarted) {
                console.log("LOPEZ :: LapTracker :: NewMessageSent :: startTracking: ", msg);
                this.startTracking(payload);
            }
        });

        this.sb3 = BroadcastService.getMessageByEventName(BroadcastEvent.HistoryMessageReceived).subscribe(async (msg) => {
            console.log("LOPEZ :: ConversationEnded:: TRACKING HISTORY ", msg);
        });

    }

    public deregister(): void {
        console.log("LOPEZ :: LapTracker deRegistered");

        // Reset State
        this.isABotConversation = false;
        this.isStarted = false;
        this.isEnded = false;
        this.startTrackingMessage = undefined;
        this.stopTrackingMessage = undefined;
        this.firstMessageReceived = false;

        // Unsubscribe from BroadcastService
        this.sb1?.unsubscribe();
        this.sb2?.unsubscribe();
        this.sb3?.unsubscribe();

        this.saveStateToLocalStorage();
        console.log("LOPEZ :: LapTracker deRegistered: ", this.isABotConversation, this.isStarted, this.isEnded, this.firstMessageReceived);
    }
}

// Export an instance of the class
export const lapTracker = new LapTracker();