/******
 * ChannelDataMiddleware
 * 
 * Adds necessary tags if not present so that the rendering middlewares can process them later.
 ******/

import { Constants } from "../../../../../common/Constants";
import { DeliveryMode } from "@microsoft/omnichannel-chat-sdk";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const channelDataMiddleware = (addConversationalSurveyTagsCallback: any) => ({ dispatch, getState }: { dispatch: any, getState: () => ILiveChatWidgetContext }) => (next: any) => (action: IWebChatAction) => {
    // draft code for using getState in middleware, but this value is undefined for some reason at this point
    // const state = getState();
    // const isConversationalSurvey = state.appStates?.isConversationalSurvey;
    // console.log("~~ ADAD isConversationalSurvey", isConversationalSurvey);

    // console.log("~~ ADAD channelDataMiddleware action", action);
    // console.log("~~ ADAD channelDataMiddleware action.type", action?.type);
    // console.log("~~ ADAD channelDataMiddleware action.payload.activity.channelData", action?.payload?.activity?.channelData);
    if (action?.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY_PENDING && action?.payload?.activity?.channelData) {
        const channelIdTag = `${Constants.channelIdKey}${Constants.ChannelId}`;
        const customerMessageTag = `${Constants.CustomerTag}`;

        // console.log("~~ ADAD action.payload.activity.channelData.tags BEFORE", action.payload.activity.channelData.tags);
        if (action.payload.activity.channelData.tags) {
            if (!action.payload.activity.channelData.tags.includes(channelIdTag)) {
                action.payload.activity.channelData.tags.push(channelIdTag);
            }
            if (!action.payload.activity.channelData.tags.includes(customerMessageTag)) {
                action.payload.activity.channelData.tags.push(customerMessageTag);
            }
            // ADAD add check for state.appState.isConversationalSurvey = true before we add this tag!
            // if (isConversationalSurvey) {
            //     if (!action.payload.activity.channelData.tags.includes(Constants.c2ConversationalSurveyMessageTag)) {
            //         action.payload.activity.channelData.tags.push(Constants.c2ConversationalSurveyMessageTag);
            //     }
            // }
        } else {
            action.payload.activity.channelData.tags = [channelIdTag];
            action.payload.activity.channelData.tags.push(customerMessageTag);
            // if (isConversationalSurvey) {
            //     action.payload.activity.channelData.tags.push(Constants.c2ConversationalSurveyMessageTag);
            // }
        }
        action = addConversationalSurveyTagsCallback(action);
        // console.log("~~ ADAD action.payload.activity.channelData.tags AFTER", action.payload.activity.channelData.tags);
        action.payload.activity.channelData.metadata = {
            deliveryMode: DeliveryMode.Bridged
        };
    }
    
    return next(action);
};

export default channelDataMiddleware;
