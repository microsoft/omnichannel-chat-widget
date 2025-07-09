import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { PostChatSurveyTelemetryMessage } from "../../../common/Constants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { getPostChatSurveyConfig, isPostChatSurveyEnabled } from "./liveChatConfigUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setPostChatContextAndLoadSurvey = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>, persistedChat?: boolean) => {
    try {
        // const postChatEnabled = await isPostChatSurveyEnabled(facadeChatSDK);
        // console.log("ADAD postChatEnabled setPostChatContextAndLoadSurvey", postChatEnabled);
        const postChatConfig = await getPostChatSurveyConfig(facadeChatSDK);
        console.log("ADAD postChatConfig setPostChatContextAndLoadSurvey()", postChatConfig);
        if (postChatConfig.isConversationalSurveyEnabled) {
            console.log("ADAD setting isConversationSurveyEnabled to true");
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_ENABLED, payload: true });
        }
        const postChatEnabled = postChatConfig.postChatEnabled;
        if (postChatEnabled) {
            if (!persistedChat) {
                TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallStarted,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallStarted
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const context: any = await facadeChatSDK.getPostChatSurveyContext();
                console.log("ADAD postChatSurveyContext facadeChatSDK setPostChatContextAndLoadSurvey()", context);
                TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallSucceed,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallSucceed
                });
                // dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });

                // Merge postChatConfig with postChatSurveyContext
                const mergedContext = {
                    ...context,
                    ...postChatConfig
                };

                console.log("ADAD mergedContext setPostChatContextAndLoadSurvey()", mergedContext);

                dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: mergedContext });
            }
            // // TODO remove below:
            // // ADAD we need to remove this, since we don't know what survey we are sending yet since it depends on which agent or bot ended the conversation
            // // this will be done in LiveChatWidgetStateful instead, within the useEffect conversationEndedBy hook
            // const isSeamlessSurvey = false;
            // if (postChatConfig.isConversationalSurveyEnabled || isSeamlessSurvey) { // ADAD check if this can set the conversational survey very early on -> no bc we need to know later who ended chat
            //     console.log("ADAD setPostChatContextAndLoadSurvey conversational survey enabled early!!");
            //     dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_DISPLAY, payload: true });
            // }
        }
    } catch (ex) {
        TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            Description: PostChatSurveyTelemetryMessage.PostChatContextCallFailed,
            ExceptionDetails: {
                exception: ex
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BroadcastService.getMessageByEventName("LoadPostChatSurvey").subscribe((msg: ICustomEvent) => {
        console.log("ADAD LoadPostChatSurvey event received", msg);
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    });
};