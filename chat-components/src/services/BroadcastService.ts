import { BroadcastChannel } from "broadcast-channel";
import { ICustomEvent } from "../interfaces/ICustomEvent";
import { Subject } from "rxjs";
import { filter } from "rxjs/operators";

const newMessage = new Subject<ICustomEvent>();

const broadcastServicePubList: Record<string, any> = {};
const broadcastServiceSubList: Record<string, any> = {};

let pubChannel: any;
let subChannel: any;

export const BroadcastServiceInitialize = (channelName: string) => {
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

    subChannel.onmessage = (message: any) => {
        newMessage.next(message);
    };
};

export const BroadcastService = {
    //broadcast a message
    postMessage: (message: ICustomEvent) => {
        /**
         * Omit copying methods to prevent 'DataCloneError' in older browsers when passing an object with functions
         * This exception occurs when an object can't be clone with the 'structured clone algorithm' (used by postMessage)
         */
        pubChannel.postMessage(JSON.parse(JSON.stringify(message)));
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

    disposeChannel: () => { pubChannel.close(); subChannel.close(); }
};
