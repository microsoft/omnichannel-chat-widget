import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { ConversationState } from "../../../contexts/common/ConversationState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setPostChatContextAndLoadSurvey = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, loadSurvey: boolean) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context: any = await chatSDK.getPostChatSurveyContext();
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.PostChatContextCallSucceed,
            Description: "Postchat context call succeed."
        });
        dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT, payload: context });
    } catch (ex) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.PostChatContextCallFailed,
            ExceptionDetails: {
                exception: ex
            }
        });
    }
    
    /* -true:   setPostChatContextAndLoadSurvey is called after passing all checks from ConfirmationPane and endChatMiddleware in usual scenario.
       -false:  Below if condition is needed for multi-tab scenarios. So when agent ends a chat and customer has opened chat in multiple tabs,  
                all tabs should show post chat survey as per existing functionality. But when an agent end a conversation, Omnichannel SDK 
                getPostChatSurveyContext returns as invalid conversation. To avoid that, caching the survey url is needed after chat starts and 
                in this case loadSurvey is false 
    */
    if (loadSurvey) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Postchat });
    }
};