import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";

// Defines startProactiveChat callback
export const startProactiveChat = (dispatch: Dispatch<ILiveChatWidgetAction>, bodyTitle?: string, showPrechat?: boolean, inNewWindow?: boolean) => {
    dispatch({
        type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
            proactiveChatBodyTitle: bodyTitle ?? "",
            proactiveChatEnablePrechat: showPrechat ?? false,
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