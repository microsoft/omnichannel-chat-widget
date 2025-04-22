

export class FirstResponseLatencyTracker {
    
    private isABotConversation = false;
    private isStarted = false;
    private isEnded = false;

    private startTrackingMessage?: TrackingMessage;
    private stopTrackingMessage?: TrackingMessage;
    private isActive = false;

    constructor() {
        // this is a workaround to ensure in reload we track effectively the messages
        // we do have a mechanism in place to prevent log agent messages.
        this.isActive = true;
        this.isABotConversation = true;
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
        console.log("LOPEZ ::::::::: :: NO_BS_TRACKER ::TRACKING IS ON :::::::::::::::::::: ");
        console.log("LOPEZ :: :: NO_BS_TRACKER ::startTracking :::: LapTracker started at: ", this.startTrackingMessage);
    }

    private handleAgentMessage(payload: MessagePayload): void {
        // this tag so far is only present in agent messages
        if (payload?.tags?.includes("public")) {
            console.log("LOPEZ :::: NO_BS_TRACKER ::handleSystemMessage: Public message detected , so we stop tracking any activity");
            this.deregister();
        }
        return;
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

    // mechanism to ensure we track only allowed conversations
    private isMessageFromValidSender(payload: MessagePayload): boolean {

        // agent scenario
        if (payload?.tags?.includes("public")) {
            this.handleAgentMessage(payload);
            return false;
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public startClock(payload: any): void {
        try {
            // in the case of a reload, tracker will be paused, until last history message is received
            // this is because we dont have a way to identidy send messages as part of the history
            //if (this.inPause) return;
            this.startTracking(payload);
        } catch (e) {
            console.error("LOPEZ :: NO_BS_TRACKER ::: sendMessage: ", e);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public stopClock(payload: any): void {
        try {
            if (!this.isMessageFromValidSender(payload)) return;

            if (this.isABotConversation && this.isStarted) {
                this.stopTracking(payload);
            }
        } catch (e) {
            console.error("LOPEZ :: NO_BS_TRACKER ::: receivedMessage: ", e);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public historyMessage(payload: any): void {
        try {
            console.log("LOPEZ :: NO_BS_TRACKER ::: historyMessage: ", payload);
            // recovering from a previous state
            this.handleAgentMessage(payload);

            if (this.isActive) {
                if (payload.role === "bot") {
                    this.isABotConversation = true;
                }
            }
        } catch (e) {
            console.error("LOPEZ :: NO_BS_TRACKER ::: historyMessage: ", e);
        }
    }

    private deregister(): void {
        // Reset State
        this.isABotConversation = false;
        this.isStarted = false;
        this.isEnded = false;
        this.startTrackingMessage = undefined;
        this.stopTrackingMessage = undefined;
        this.isActive = false;
    }
}

