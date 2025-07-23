import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { LiveChatWidgetActionType } from "../../../../../contexts/common/LiveChatWidgetActionType";
import { executeReducer } from "../../../../../contexts/createReducer";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { Constants } from "../../../../../common/Constants";
import { isEndConversationDueToOverflowActivity } from "../../../../../common/utils";

const queueOverflowHandlingHelper = async (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });
    if (!appStates.chatDisconnectEventReceived) {
        dispatch({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: true });
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.QueueOverflowEvent,
            Description: "Set chat disconnect event received."
        });
    }
};

export const createQueueOverflowMiddleware = (state: ILiveChatWidgetContext,
    dispatch: Dispatch<ILiveChatWidgetAction>) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {
    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {

        const activity = action.payload.activity;
        if (isEndConversationDueToOverflowActivity(activity)) {
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.QueueOverflowEvent,
                Description: "Queue overflow event received."
            });
            queueOverflowHandlingHelper(state, dispatch);
        }
    }

    return next(action);
};
