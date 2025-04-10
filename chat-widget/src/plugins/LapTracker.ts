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
            console.log("LOPEZ :: loadStateFromLocalStorage :: ", parsedState);
            this.isABotConversation = parsedState.isABotConversation;
            this.firstMessageReceived = parsedState.firstMessageReceived;
        }
    }*/

    /*private saveStateToLocalStorage(): void {
        const conversationState = {
            isABotConversation: this.isABotConversation,
            firstMessageReceived: this.firstMessageReceived,
        };
        localStorage?.setItem("conversationState", JSON.stringify(conversationState));
        console.log("LOPEZ :: saveStateToLocalStorage ::: ", conversationState);
    }*/

    // Tracking Functions
    private startTracking(payload: MessagePayload): void {
        if (this.isStarted) {
            console.log("LOPEZ :: startTracking :: LapTracker already started, ignoring startTracking call");
            return;
        }

        if (!this.isABotConversation){
            console.log("LOPEZ :: startTracking :: LapTracker is not  a BotConversation, ignoring startTracking call");
            return;
        }

        console.log("LOPEZ :: LapTracker :: startTracking: ", this.isStarted, this.isABotConversation);
        
        this.isStarted = true;
        this.isEnded = false;
        this.startTrackingMessage = this.createTrackingMessage(payload, "userMessage");
        console.log("LOPEZ ::::::::: TRACKING IS ON :::::::::::::::::::: ");
        console.log("LOPEZ :: startTracking :::: LapTracker started at: ", this.startTrackingMessage);
    }

    private stopTracking(payload: MessagePayload): void {
        
        if (this.isEnded && !this.isStarted) {
            console.log("LOPEZ :: stopTracking :: LapTracker already ended, ignoring stopTracking call");
            return;
        }

        this.isEnded = true;
        this.isStarted = false;
        this.stopTrackingMessage = this.createTrackingMessage(payload, "botMessage");

        const elapsedTime = (this.stopTrackingMessage?.checkTime ?? 0) - (this.startTrackingMessage?.checkTime ?? 0);

        console.log("LOPEZ ::::::::: TRACKING IS OFF :::::::::::::::::::: ");
        console.log("LOPEZ ::stopTracking::LapTracker stopped after : ", elapsedTime);
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.MessageLapTrack,
            Description: "New message received",
            Data: {
                elapsedTime,
                userMessage: this.startTrackingMessage,
                botMessage: this.stopTrackingMessage
            }
        });
    }

    // Public Methods
    public register(): void {
        console.log("LOPEZ :: LapTracker registered");
        // Listener for new messages received
        this.sb1 = BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageReceived).subscribe(async (msg) => {
            const { payload } = msg;
            console.log("LOPEZ :: NewMessageReceived:: LapTracker event received: ", this.isABotConversation, this.isStarted);

            if (!this.firstMessageReceived) {
                this.firstMessageReceived = true;

                if (payload?.role === "bot") {
                    this.isABotConversation = true;
                    //this.saveStateToLocalStorage();
                    console.log("LOPEZ :: NewMessageReceived ::: First message from bot: ", msg, this.isABotConversation, this.isStarted);
                    return;
                }
            }

            if (this.isABotConversation && this.isStarted) {
                console.log("LOPEZ :: LapTracker :: NewMessageReceived :: stopTracking: ", msg);
                this.stopTracking(payload);
            }
        });

        // Listener for new messages sent
        this.sb2 = BroadcastService.getMessageByEventName(BroadcastEvent.NewMessageSent).subscribe(async (msg) => {
            console.log("LOPEZ :: NewMessageSent:: LapTracker event received: ", this.isABotConversation, this.isStarted, msg);
            const { payload } = msg;
            console.log("LOPEZ :: LapTracker :: NewMessageSent :: startTracking: ", msg);
            this.startTracking(payload);
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

        //this.saveStateToLocalStorage();
        console.log("LOPEZ :: LapTracker deRegistered: ", this.isABotConversation, this.isStarted, this.isEnded, this.firstMessageReceived);
    }
}

// Export an instance of the class
export const lapTracker = new LapTracker();