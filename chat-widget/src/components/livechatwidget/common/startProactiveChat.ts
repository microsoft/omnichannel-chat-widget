import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { IProactiveChatNotificationConfig } from "../../proactivechatpanestateful/interfaces/IProactiveChatNotificationConfig";

// Defines startProactiveChat callback
export const startProactiveChat = (dispatch: Dispatch<ILiveChatWidgetAction>, notificationConfig?: IProactiveChatNotificationConfig, enablePreChat?: boolean, inNewWindow?: boolean) => {
    dispatch({
        type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
            proactiveChatBodyTitle: (notificationConfig && notificationConfig.message) ? notificationConfig.message : "",
            proactiveChatEnablePrechat: enablePreChat ?? false,
            proactiveChatInNewWindow: inNewWindow ?? false
        }
    });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ProactiveChat });
    TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
        Event: TelemetryEvent.IncomingProactiveChatScreenLoaded,
        ElapsedTimeInMilliseconds: TelemetryTimers.LcwLoadToChatButtonTimer.milliSecondsElapsed,
        Description: "Incoming proactive chat loaded."
    });
};