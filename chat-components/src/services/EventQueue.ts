import { Subject } from "rxjs";
import { ICustomEvent } from "../interfaces/ICustomEvent";

class EventQueue {
    private queueing: boolean = false;
    private channelEventQueue: Map<string, ICustomEvent>;
    private queueingId?: NodeJS.Timeout;
    private newMessage: Subject<ICustomEvent>;

    constructor(newMessage: Subject<ICustomEvent>) {
        this.channelEventQueue = new Map<string, ICustomEvent>();
        this.newMessage = newMessage;
    }

    processEvents() {
        this.channelEventQueue.forEach((event, eventId) => { // Process entry based on insertion order
            this.newMessage.next(event); // Post event directly instead of using pubChannel
            this.channelEventQueue.delete(eventId); // Remove event from queue regardless of outcome
        });
    }

    queueEvents(timeout = 500) {
        this.stopIfEmpty();

        if (this.queueingId) { // Queueing in progress
            return;
        }

        if (this.queueing) {
            this.queueingId = setTimeout(() => {
                this.processEvents();
                this.queueEvents(timeout);
            }, timeout);
        }
    }

    startQueue(timeout = 500) {
        this.queueing = true;
        this.queueEvents(timeout);
    }

    stopIfEmpty() {
        if (this.channelEventQueue.size === 0) {
            if (this.queueingId) {
                clearTimeout(this.queueingId);
            }

            this.queueing = false;
            this.queueingId = undefined;
        }
    }

    pushEvent(event: any) {
        if (event.eventId) {
            this.channelEventQueue.set(event.eventId, event);
        }
    }

    popEvent(event: any) {
        if (event.eventId) {
            this.channelEventQueue.delete(event.eventId);
        }
    }

    dispose() {
        if (this.queueingId) {
            clearTimeout(this.queueingId);
            this.queueingId = undefined;
        }

        this.channelEventQueue.clear();
    }
}

export default EventQueue;