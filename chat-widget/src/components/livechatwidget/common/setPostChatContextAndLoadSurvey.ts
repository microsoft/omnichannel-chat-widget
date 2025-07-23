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
import { TelemetryManager } from "../../../common/telemetry/TelemetryManager";
import { getPostChatSurveyConfig } from "./liveChatConfigUtils";
import { isFromOtherRuntime } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setPostChatContextAndLoadSurvey = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>, persistedChat?: boolean, isTabValidationEnabled?: boolean) => {
    try {
        const postChatConfig = await getPostChatSurveyConfig(facadeChatSDK);
        if (postChatConfig.isConversationalSurveyEnabled) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATIONAL_SURVEY_ENABLED, payload: true });
        }
        const postChatEnabled = postChatConfig.postChatEnabled;
        if (postChatEnabled) {
            if (!persistedChat) {
                TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallStarted,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallStarted
                });
                console.error("setPostChatContextAndLoadSurvey :: getPostChatSurveyContext");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const context: any = await facadeChatSDK.getPostChatSurveyContext();

                console.error("setPostChatContextAndLoadSurvey :2 : getPostChatSurveyContext", context);

                TelemetryHelper.logSDKEventToAllTelemetry(LogLevel.INFO, {
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
        // If the startChat event is not initiated by the same tab. Ignore the call
        if (isFromOtherRuntime(msg?.payload?.runtimeId, TelemetryManager?.InternalTelemetryData?.lcwRuntimeId, isTabValidationEnabled ?? false)) {
            console.error("[BSL] Get out of here =>", isTabValidationEnabled, msg?.payload?.runtimeId, TelemetryManager?.InternalTelemetryData?.lcwRuntimeId);
            return;
        }
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    });
};