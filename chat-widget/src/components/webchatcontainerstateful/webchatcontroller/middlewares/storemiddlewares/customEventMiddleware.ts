/******
 * CustomEventMiddleware
 *
 * This middleware is invoked when a custom event is received.
 * The callback is then invoked to handle the custom event.
 ******/

import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { Constants } from "../../../../../common/Constants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";

export const isValidCustomEvent = (activity: {
    channelData?: {
        metadata?: {
            customEvent?: string;
            customEventName?: string;
            customEventValue?: unknown;
        }
    },
    from?: {
        role: string;
    }
}) => {
    return !!(activity?.channelData?.metadata?.customEvent 
            && typeof activity?.channelData?.metadata?.customEvent === Constants.String
            && activity?.channelData?.metadata?.customEvent?.toLowerCase() === Constants.true
            && activity?.from?.role !== Constants.userMessageTag
            && typeof activity?.channelData?.metadata?.customEventName === Constants.String
            && activity?.channelData?.metadata?.customEventValue);
};

const createCustomEventMiddleware = (broadcastservice: typeof BroadcastService) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {
    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {
        const activity = action.payload.activity;
        if (isValidCustomEvent(activity)){
            const customEvent: ICustomEvent = {
                eventName: Constants.onCustomEvent,
                payload: {
                    messageId: activity.messageid ?? activity.id,
                    customEventName: activity.channelData.metadata.customEventName,
                    customEventValue: activity.channelData.metadata.customEventValue
                }
            };
            broadcastservice.postMessage(customEvent);
            return;
        }
    }
    
    return next(action);
};

export default createCustomEventMiddleware;
