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
        const postChatConfig = await getPostChatSurveyConfig(facadeChatSDK);
        if (postChatConfig.isConversationalSurveyEnabled) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_ENABLED, payload: true });
        }
        const postChatEnabled = postChatConfig.postChatEnabled;
        if (postChatEnabled) {
            if (!persistedChat) {
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallStarted,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallStarted
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const context: any = await facadeChatSDK.getPostChatSurveyContext();
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallSucceed,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallSucceed
                });

                // Merge postChatConfig with postChatSurveyContext
                const mergedContext = {
                    ...context,
                    ...postChatConfig
                };

                dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: mergedContext });
            }
        }
    } catch (ex) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            Description: PostChatSurveyTelemetryMessage.PostChatContextCallFailed,
            ExceptionDetails: {
                exception: ex
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    BroadcastService.getMessageByEventName("LoadPostChatSurvey").subscribe((msg: ICustomEvent) => {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    });
};