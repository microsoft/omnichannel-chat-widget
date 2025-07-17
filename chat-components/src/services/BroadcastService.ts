import { Subject } from "rxjs";
import { ICustomEvent } from "../interfaces/ICustomEvent";
import { filter } from "rxjs/operators";
import { BroadcastChannel } from "broadcast-channel";

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
    private channelEventQueue: ICustomEvent[];
    private queuingId?: NodeJS.Timeout;

    constructor() {
        this.channelEventQueue = [];
        this.queueEvents();
    }

    processEvents() {
        let queueSize = this.channelEventQueue.length; // Set queue size before processing to prevent infinite loop
        while (queueSize > 0) {
            const event = this.channelEventQueue.shift();
            if (event) {
                pubChannel.postMessage(event);
            }

            queueSize -= 1;
        }
    }

    queueEvents(timeout = 3000) {
        this.processEvents();
        if (this.queueing) {
            this.queuingId = setTimeout(() => {
                this.queueEvents();
            }, timeout);
        }
    }

    resumeQueueing() {
        this.queueing = true;
    }

    stopQueueing() {
        this.queueing = false;
        this.queuingId = undefined
    }

    pushEvent(event: any) {
        this.channelEventQueue.push(event);
    }

    popEvent(event: any) {
        const eventId = event.eventId;
        this.channelEventQueue = this.channelEventQueue.filter(event => event.eventId !== eventId);
    }

    dispose() {
        if (this.queuingId) {
            clearTimeout(this.queuingId);
            this.queuingId = undefined;
        }
        this.channelEventQueue = [];
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
            const eventId = new Date().getTime();
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
