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
import { isPostChatSurveyEnabled } from "./liveChatConfigUtils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setPostChatContextAndLoadSurvey = async (facadeChatSDK: FacadeChatSDK, dispatch: Dispatch<ILiveChatWidgetAction>, persistedChat?: boolean) => {
    try {
        const postChatEnabled = await isPostChatSurveyEnabled(facadeChatSDK);
        if (postChatEnabled) {
            if (!persistedChat) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const context: any = await facadeChatSDK.getPostChatSurveyContext();
                TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.PostChatContextCallSucceed,
                    Description: PostChatSurveyTelemetryMessage.PostChatContextCallSucceed
                });
                dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });
            }
        }
    } catch (ex) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
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