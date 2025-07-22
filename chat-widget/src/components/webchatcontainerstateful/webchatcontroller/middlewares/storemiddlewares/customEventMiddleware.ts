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


const createCustomEventMiddleware = () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {
    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {
        console.log("debugging: received incoming activity: ", action);
        const activity = action.payload.activity;
        if (activity?.channelData?.metadata?.customEvent 
            && typeof activity?.channelData?.metadata?.customEvent === Constants.String && activity?.channelData?.metadata?.customEvent?.toLowerCase() === Constants.true
            && activity?.from?.role !== Constants.userMessageTag){
            const customEvent: ICustomEvent = {
                eventName: Constants.onCustomEvent,
                payload: {
                    messageId: activity.messageid ?? activity.id,
                    customEventName: activity.channelData.metadata.customEventName,
                    customEventValue: activity.channelData.metadata.customEventValue
                }
            };
            console.log("debugging: posting customEvent: ", customEvent);
            BroadcastService.postMessage(customEvent);
            return;
        }
    }
    
    return next(action);
};

export default createCustomEventMiddleware;
