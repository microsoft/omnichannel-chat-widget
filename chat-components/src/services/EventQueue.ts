import { Subject } from "rxjs";
import { ICustomEvent } from "../interfaces/ICustomEvent";

class EventQueue {
    private queueing: boolean = true;
    private channelEventQueue: Map<string, ICustomEvent>;
    private queueingId?: NodeJS.Timeout;
    private newMessage: Subject<ICustomEvent>;

    constructor(newMessage: Subject<ICustomEvent>) {
        this.channelEventQueue = new Map<string, ICustomEvent>();
        this.newMessage = newMessage;
    }

    processEvents(deferTimeout = 0) {
        const dequeue = () => {
            let queueSize = this.channelEventQueue.size; // Set queue size before processing to prevent infinite loop
            while (queueSize > 0) {
                const entries = this.channelEventQueue.entries();
                const entry = entries.next(); // Process entry based on insertion order
                if (entry?.value) {
                    const [_, event] = entry.value;
                    this.newMessage.next(event); // Post event directly instead of using pubChannel
                    if (event.eventId) {
                        this.channelEventQueue.delete(event?.eventId); // Remove event from queue regardless of outcome
                    }
                }
                queueSize -= 1;
            }
        }

        setTimeout(() => {
            dequeue();
        }, deferTimeout);
    }

    queueEvents(timeout = 3000) {
        this.processEvents();
        if (this.queueing) {
            this.queueingId = setTimeout(() => {
                this.queueEvents();
            }, timeout);
        }
    }

    resumeQueueing() {
        this.queueing = true;
    }

    stopQueueing() {
        this.queueing = false;
        this.queueingId = undefined;
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