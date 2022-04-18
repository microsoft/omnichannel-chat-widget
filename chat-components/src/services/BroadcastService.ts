import { Subject } from "rxjs";
import { ICustomEvent } from "../interfaces/ICustomEvent";
import { filter } from "rxjs/operators";
import { BroadcastChannel } from "broadcast-channel";
import { BROADCAST_CHANNEL_NAME } from "../common/Constants";

const newMessage = new Subject<ICustomEvent>();

const pubChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
const subChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
subChannel.onmessage = (message: any) => {
    newMessage.next(message);
};

export const BroadcastService = {
    //broadcast a message
    postMessage: (message: ICustomEvent) => {
        pubChannel.postMessage(message);
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
