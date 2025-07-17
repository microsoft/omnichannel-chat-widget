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
    console.log("debugging: current conversation state: ", appStates.conversationState);
    if (appStates.conversationState !== ConversationState.Closed) {
        let closed = false;
        try {
            closed = await checkConversationDetailsUntilConversationClosed(facadeChatSDK);
            if (closed) {
                // if the conversation is closed, dispatch the action to set conversation state to closed
                const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });
                console.log("debugging: current state for closed state", appStates.conversationState);
                if (appStates.conversationState !== ConversationState.InActive) {
                    console.log("debugging: conversation closed after participant removed event");
                    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
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
    console.log("debugging: attempt to fetch lwi details: ", new Date().toISOString());

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


    // getConversationDetailsCall(facadeChatSDK).then((_conversationDetails) => {
    //     console.log("debugging: conversation details received participantAddedCallback", _conversationDetails);
    //     const conversationDetails = _conversationDetails as unknown as { state: string } | undefined;
    //     if (conversationDetails && "state" in conversationDetails && conversationDetails?.state) {
    //         //let tempState = state.appStates.conversationState;
    //         if (conversationDetails?.state === "Open" || conversationDetails?.state === "Active") {
    //             // tempState = ConversationState.Active;
    //             // console.log("debugging: dispatching conversation state to active");
    //             // dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: tempState });
    //             const { appStates } = executeReducer(state, { type: LiveChatWidgetActionType.GET_IN_MEMORY_STATE, payload: undefined });
    //             console.log("debugging: current state for Open and Active states", appStates.conversationState);
    //             if (appStates.conversationState !== ConversationState.Active) {
    //                 dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active });
    //             }
    //         }
    //     }
    // }).catch((error) => {
    //     console.error("debugging: Error getting conversation details participantAddedCallback:", error);
    // });
};

export const createParticipantUpdateMiddleware = (state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK) => () => (next: (action: IWebChatAction) => void) => (action: IWebChatAction) => {
    // try {
    //     console.log("debugging: all action received: ", action);
    // } catch (error) {
    //     console.error("debugging: error occurred while processing action: ", error);
    // }

    if (action?.type == WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity) {

        const activity = action.payload.activity;

        // {
        //     "type": "DIRECT_LINE/INCOMING_ACTIVITY",
        //     "payload": {
        //         "activity": {
        //             "channelId": "ACS_CHANNEL",
        //             "conversation": {},
        //             "channelData": {
        //                 "type": "Thread",
        //                 "members": [
        //                     {
        //                         "id": "8:acs:2e998d85-112d-4a9e-b84e-b4d3bd093d2f_00000028-5321-2df3-c3f7-3a3a0d0067d3",
        //                         "displayName": "Customer",
        //                         "tag": "left"
        //                     }
        //                 ]
        //             },
        //             "from": {
        //                 "role": "channel"
        //             },
        //             "id": "8:acs:2e998d85-112d-4a9e-b84e-b4d3bd093d2f_00000028-5321-2df3-c3f7-3a3a0d0067d3",
        //             "timestamp": "2025-06-30T17:56:07.629Z",
        //             "type": "message",
        //             "text": "\"Customer left chat\"",
        //             "actionType": "DIRECT_LINE/INCOMING_ACTIVITY"
        //         }
        //     }
        // }

        if (activity.channelId === "ACS_CHANNEL") {
            console.log("debugging: action received in participantUpdateMiddleware", action);
            if (activity.channelData?.type === "Thread"
                && activity.channelData?.members?.length > 0) {
                if (activity.channelData.members[0].tag === "left") { 
                    void participantRemovedCallback(state, dispatch, facadeChatSDK);
                } else if (activity.channelData.members[0].tag === "joined") {
                    void participantAddedCallback(state, dispatch, facadeChatSDK);
                }
            }
        }
    }

    return next(action);
};

