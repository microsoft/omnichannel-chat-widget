import { Subject } from "rxjs";
import { ICustomEvent } from "../interfaces/ICustomEvent";
import { filter } from "rxjs/operators";
import { BroadcastChannel } from "broadcast-channel";
import { uuidv4 } from "../common/utils";

const newMessage = new Subject<ICustomEvent>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const broadcastServicePubList: Record<string, any> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const broadcastServiceSubList: Record<string, any> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pubChannel: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let subChannel: any;
let eventQueue: EventQueue;

class EventQueue {
    private queueing: boolean = true;
    private channelEventQueue: Map<string, ICustomEvent>;
    private queueingId?: NodeJS.Timeout;

    constructor() {
        this.channelEventQueue = new Map<string, ICustomEvent>();
        this.queueEvents();
    }

    processEvents() {
        let queueSize = this.channelEventQueue.size; // Set queue size before processing to prevent infinite loop
        while (queueSize > 0) {
            const entries = this.channelEventQueue.entries();
            const entry = entries.next(); // Process entry based on insertion order
            if (entry?.value) {
                const [_, event] = entry.value;
                pubChannel.postMessage(event);
            }
            queueSize -= 1;
        }
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
        this.channelEventQueue.set(event.eventId, event);
    }

    popEvent(event: any) {
        const eventId = event.eventId;
        this.channelEventQueue.delete(eventId);
    }

    dispose() {
        if (this.queueingId) {
            clearTimeout(this.queueingId);
            this.queueingId = undefined;
        }

        this.channelEventQueue.clear();
    }
}

export const BroadcastServiceInitialize = (channelName: string) => {
    eventQueue = new EventQueue();

    if (broadcastServicePubList[channelName]) {
        pubChannel = broadcastServicePubList[channelName];
    } else {
        const newPubChannel = new BroadcastChannel(channelName);
        broadcastServicePubList[channelName] = newPubChannel;
        pubChannel = newPubChannel;
    }

    if (broadcastServiceSubList[channelName]) {
        subChannel = broadcastServiceSubList[channelName];
    } else {
        const newSubChannel = new BroadcastChannel(channelName);
        broadcastServiceSubList[channelName] = newSubChannel;
        subChannel = newSubChannel;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subChannel.onmessage = (message: any) => {
        newMessage.next(message);
        eventQueue.popEvent(message);
    };
};

export const BroadcastService = {
    //broadcast a message
    postMessage: (message: ICustomEvent) => {
        /**
         * Omit copying methods to prevent 'DataCloneError' in older browsers when passing an object with functions
         * This exception occurs when an object can't be clone with the 'structured clone algorithm' (used by postMessage)
         */
        try {
            const messageCopy = JSON.parse(JSON.stringify(message));
            const eventId = uuidv4();
            const event = {...messageCopy, eventId};

            pubChannel.postMessage(event);
            eventQueue.pushEvent(event);
        } catch (error) {
            console.error("Error in BroadcastService.postMessage:", error);
        }
    },

    getMessage: (message: ICustomEvent) => {
        return newMessage.pipe(
            filter(msg => msg.elementId == message.elementId &&
                msg.elementType == message.elementType &&
                msg.eventName == message.eventName)
        );
    },

    getMessageByEventName: (eventName: string) => {
        return newMessage.pipe(
            filter(message => message.eventName === eventName)
        );
    },

    getAnyMessage: () => {
        return newMessage;
    },

    disposeChannel: () => { pubChannel.close(); subChannel.close(); eventQueue.dispose(); },
};
