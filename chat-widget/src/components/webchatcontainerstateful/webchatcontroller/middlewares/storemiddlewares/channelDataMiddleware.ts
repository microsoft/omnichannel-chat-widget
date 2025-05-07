/******
 * ChannelDataMiddleware
 * 
 * Adds necessary tags if not present so that the rendering middlewares can process them later.
 ******/

import { Constants } from "../../../../../common/Constants";
import { DeliveryMode } from "@microsoft/omnichannel-chat-sdk";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const channelDataMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action?.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY_PENDING && action?.payload?.activity?.channelData) {
        const channelIdTag = `${Constants.channelIdKey}${Constants.ChannelId}`;
        const customerMessageTag = `${Constants.CustomerTag}`;

        if (action.payload.activity.channelData.tags) {
            if (!action.payload.activity.channelData.tags.includes(channelIdTag)) {
                action.payload.activity.channelData.tags.push(channelIdTag);
            }
            if (!action.payload.activity.channelData.tags.includes(customerMessageTag)) {
                action.payload.activity.channelData.tags.push(customerMessageTag);
            }
        } else {
            action.payload.activity.channelData.tags = [channelIdTag];
            action.payload.activity.channelData.tags.push(customerMessageTag);
        }
        action.payload.activity.channelData.metadata = {
            deliveryMode: DeliveryMode.Bridged
        };
    }
    
    return next(action);
};

export default channelDataMiddleware;
