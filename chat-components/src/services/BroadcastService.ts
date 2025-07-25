import { Subject } from "rxjs";
import { ICustomEvent } from "../interfaces/ICustomEvent";
import { IPostMessageOptions } from "../interfaces/IPostMessageOptions";
import { filter } from "rxjs/operators";
import { BroadcastChannel } from "broadcast-channel";
import { uuidv4 } from "../common/utils";
import EventQueue from "./EventQueue";

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

export const BroadcastServiceInitialize = (channelName: string) => {
    eventQueue = new EventQueue(newMessage);

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
        eventQueue.stopIfEmpty();
    };
};

export const BroadcastService = {
    //broadcast a message
    postMessage: (message: ICustomEvent, options: IPostMessageOptions = {retry: true}) => {
        /**
         * Omit copying methods to prevent 'DataCloneError' in older browsers when passing an object with functions
         * This exception occurs when an object can't be clone with the 'structured clone algorithm' (used by postMessage)
         */
        try {
            const messageCopy = JSON.parse(JSON.stringify(message));
            const eventId = uuidv4();
            const event = {...messageCopy, eventId};

            eventQueue.pushEvent(event);
            pubChannel.postMessage(event);
        } catch (error) {
            console.error("Error in BroadcastService.postMessage:", error);
        }

        if (options?.retry) {
            const queueTimeout = options?.queueTimeout || 500;
            eventQueue.startQueue(queueTimeout);
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
