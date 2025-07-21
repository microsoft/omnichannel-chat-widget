import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { checkConversationDetailsUntilConversationClosed } from "../../../../../common/utils";
import { LiveChatWidgetActionType } from "../../../../../contexts/common/LiveChatWidgetActionType";
import { executeReducer } from "../../../../../contexts/createReducer";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { FacadeChatSDK } from "../../../../../common/facades/FacadeChatSDK";

const participantRemovedCallHelper = async (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.ParticipantsRemovedEvent,
        Description: "participant removed event received."
    });
    const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });
    if (!appStates.chatDisconnectEventReceived) {
        try {
            const closed = await checkConversationDetailsUntilConversationClosed(facadeChatSDK);
            if (closed) {
                if (!appStates.chatDisconnectEventReceived) {
                    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: true });
                }
            }
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ParticipantsRemovedEvent,
                Description: "Failed to process participant removed callback event",
                ExceptionDetails: {
                    error
                }
            });
        }
    }
};

export const createParticipantRemovedMiddleware = (state: ILiveChatWidgetContext,
    dispatch: Dispatch<ILiveChatWidgetAction>,
    facadeChatSDK: FacadeChatSDK) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {
    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {

        const activity = action.payload.activity;
        if (activity.channelId === "ACS_CHANNEL") {
            if (activity.channelData?.type === "Thread"
                && activity.channelData?.members?.length > 0) {
                if (activity.channelData.members[0].tag === "left") { 
                    void participantRemovedCallHelper(state, dispatch, facadeChatSDK);
                } 
            }
        }
    }

    return next(action);
};

