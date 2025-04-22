

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

export class NoBsLapTracker {
    private isABotConversation = false;
    private isStarted = false;
    private isEnded = false;
    private firstMessageReceived = false;

    private startTrackingMessage?: TrackingMessage;
    private stopTrackingMessage?: TrackingMessage;
    private inPause = false;
    private isActive = false;

    constructor() {
        this.isActive = true;
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

    // Tracking Functions
    private startTracking(payload: MessagePayload): void {
        if (this.isStarted) {
            return;
        }

        if (!this.isABotConversation) {
            return;
        }

        this.isStarted = true;
        this.isEnded = false;
        this.startTrackingMessage = this.createTrackingMessage(payload, "userMessage");
        console.log("LOPEZ ::::::::: :: NO_BS_TRACKER ::TRACKING IS ON :::::::::::::::::::: ");
        console.log("LOPEZ :: :: NO_BS_TRACKER ::startTracking :::: LapTracker started at: ", this.startTrackingMessage);
    }

    private handleAgentMessage(payload: MessagePayload): void {
        if (payload?.tags?.includes("public")) {
            console.log("LOPEZ :::: NO_BS_TRACKER ::handleSystemMessage: Public message detected , so we stop tracking any activity");
            this.deregister();
        }

        return;
    }


    private stopTracking(payload: MessagePayload): void {
        if (this.isEnded && !this.isStarted) {
            return;
        }
        this.isEnded = true;
        this.isStarted = false;
        this.stopTrackingMessage = this.createTrackingMessage(payload, "botMessage");
        const elapsedTime = (this.stopTrackingMessage?.checkTime ?? 0) - (this.startTrackingMessage?.checkTime ?? 0);

        console.log("LOPEZ :: NO_BS_TRACKER ::::::::: TRACKING IS OFF :::::::::::::::::::: ");
        console.log("LOPEZ :: NO_BS_TRACKER :: stopTracking::LapTracker stopped after : ", elapsedTime);
        /*TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.MessageLapTrack,
            Description: "New message received",
            Data: {
                elapsedTime,
                userMessage: this.startTrackingMessage,
                botMessage: this.stopTrackingMessage
            }
        });*/
    }

    private isMessageFromValidSender(payload: MessagePayload): boolean {
        if (payload?.tags?.includes("public")) {
            this.handleAgentMessage(payload);
            return false;
        }

        return true;
    }

    private isReadyToStartTracking(payload: MessagePayload): boolean {
        if (!this.firstMessageReceived) {
            this.firstMessageReceived = true;
            if (payload?.role === "bot") {
                this.isABotConversation = true;
                // return false to do not start tracking yet , until next interaction
                // this is because this is the first message from the bot and we need to wait for the user to send a message
                return false;
            }
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public sendMessage(payload: any): void {
        // in the case of a reload, tracker will be paused, until last history message is received
        // this is because we dont have a way to identidy send messages as part of the history
        //if (this.inPause) return;
        this.startTracking(payload);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public receivedMessage(payload: any): void {

        if (!this.isMessageFromValidSender(payload)) return;
        if (!this.isReadyToStartTracking(payload)) return;

        if (this.isABotConversation && this.isStarted) {
            this.stopTracking(payload);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public historyMessage(payload: any): void {
        // recovering from a previous state
        this.handleAgentMessage(payload);

        if (this.isActive){
            if (payload.role === "bot") {
                this.isABotConversation = true;
            }
        }
    }

    private deregister(): void {
        // Reset State
        this.isABotConversation = false;
        this.isStarted = false;
        this.isEnded = false;
        this.startTrackingMessage = undefined;
        this.stopTrackingMessage = undefined;
        this.firstMessageReceived = false;
        this.isActive = false;
        console.log("LOPEZ :: NO_BS_TRACKER ::: deRegistered: ", this.isABotConversation, this.isStarted, this.isEnded, this.firstMessageReceived);
    }
}

