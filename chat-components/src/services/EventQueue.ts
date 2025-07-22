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
        const dequeue = () => {
            this.channelEventQueue.forEach((event, eventId) => { // Process entry based on insertion order
                this.newMessage.next(event); // Post event directly instead of using pubChannel
                this.channelEventQueue.delete(eventId); // Remove event from queue regardless of outcome
            });
        };

        dequeue();
    }

    queueEvents(timeout = 500) {
        if (this.channelEventQueue.size === 0) { // Base case
            this.queueing = false;
            this.queueingId = undefined;
            return;
        }

        if (this.queueingId) { // Queueing in progress
            return;
        }

        this.processEvents();
        if (this.queueing) {
            this.queueingId = setTimeout(() => {
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