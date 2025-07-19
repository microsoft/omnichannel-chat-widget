import { Constants } from "../../../../../common/Constants";
import { DirectLineSenderRole } from "../../enums/DirectLineSenderRole";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
// import { MessageTypes } from "../../enums/MessageType";
import { WebChatActionType } from "../../enums/WebChatActionType";

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { checkConversationDetailsUntilConversationClosed, getConversationDetailsCall } from "../../../../../common/utils";
import { ConversationState } from "../../../../../contexts/common/ConversationState";
import { LiveChatWidgetActionType } from "../../../../../contexts/common/LiveChatWidgetActionType";
import { executeReducer } from "../../../../../contexts/createReducer";
import { ILiveChatWidgetContext } from "../../../../../contexts/common/ILiveChatWidgetContext";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../../../contexts/common/ILiveChatWidgetAction";
import { FacadeChatSDK } from "../../../../../common/facades/FacadeChatSDK";

export const participantRemovedCallback = async (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK) => {
    TelemetryHelper.logActionEvent(LogLevel.INFO, {
        Event: TelemetryEvent.ParticipantsRemovedEvent,
        Description: "participant removed event received."
    });
    const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });
    if (appStates.conversationState !== ConversationState.Closed) {
        let closed = false;
        try {
            closed = await checkConversationDetailsUntilConversationClosed(facadeChatSDK);
            if (closed) {
                // if the conversation is closed, dispatch the action to set conversation state to closed
                const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });
                if (appStates.conversationState !== ConversationState.InActive) {
                    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
                }
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

export const participantAddedCallback = async (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK) => {
    const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });

    if (appStates.conversationState !== ConversationState.Active) {
        try {
            const conversationDetails = await getConversationDetailsCall(facadeChatSDK) as unknown as { state: string } | undefined;
            if (conversationDetails?.state === "Open" || conversationDetails?.state === "Active") {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active });
            }
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ParticipantsAddedEvent,
                Description: "Failed to process participant added callback event",
                ExceptionDetails: {
                    error
                }
            });
        }
    }
};

export const createParticipantUpdateMiddleware = (state: ILiveChatWidgetContext,
    dispatch: Dispatch<ILiveChatWidgetAction>,
    facadeChatSDK: FacadeChatSDK,
    participantAddCallback: (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>,facadeChatSDK: FacadeChatSDK) => Promise<void>,
    participantRemoveCallback: (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK) => Promise<void>) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {
    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {

        const activity = action.payload.activity;
        if (activity.channelId === "ACS_CHANNEL") {
            if (activity.channelData?.type === "Thread"
                && activity.channelData?.members?.length > 0) {
                if (activity.channelData.members[0].tag === "left") { 
                    void participantRemoveCallback(state, dispatch, facadeChatSDK);
                } else if (activity.channelData.members[0].tag === "joined") {
                    void participantAddCallback(state, dispatch, facadeChatSDK);
                }
            }
        }
    }

    return next(action);
};

