/* eslint-disable indent */

import { ConversationState } from "./common/ConversationState";
import { IInternalTelemetryData } from "../common/telemetry/interfaces/IInternalTelemetryData";
import { ILiveChatWidgetAction } from "./common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "./common/ILiveChatWidgetContext";
import { ILiveChatWidgetLocalizedTexts } from "./common/ILiveChatWidgetLocalizedTexts";
import { IRenderingMiddlewareProps } from "../components/webchatcontainerstateful/interfaces/IRenderingMiddlewareProps";
import { LiveChatWidgetActionType } from "./common/LiveChatWidgetActionType";
import { ConfirmationState, ConversationEndEntity, ParticipantType } from "../common/Constants";
import { PostChatSurveyMode } from "../components/postchatsurveypanestateful/enums/PostChatSurveyMode";
import { StartChatFailureType } from "./common/StartChatFailureType";

export const createReducer = () => {
    return reducer;
};

export const executeReducer = (state: ILiveChatWidgetContext, action: ILiveChatWidgetAction): ILiveChatWidgetContext => {
    return reducer(state, action);
};

// inMemory state to store the runtime state of the widget for access immediately
let inMemory: ILiveChatWidgetContext;

const reducer = (state: ILiveChatWidgetContext, action: ILiveChatWidgetAction): ILiveChatWidgetContext => {

    // Initialize inMemory state
    if (!inMemory) {
        inMemory = state;
    }

    switch (action.type) {
        case LiveChatWidgetActionType.SET_WIDGET_ELEMENT_ID:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    widgetElementId: action.payload as string
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    widgetElementId: action.payload as string
                }
            };

        case LiveChatWidgetActionType.SET_RENDERING_MIDDLEWARE_PROPS:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    renderingMiddlewareProps: action.payload as IRenderingMiddlewareProps
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    renderingMiddlewareProps: action.payload as IRenderingMiddlewareProps
                }
            };

        case LiveChatWidgetActionType.SET_MIDDLEWARE_LOCALIZED_TEXTS:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    middlewareLocalizedTexts: action.payload as ILiveChatWidgetLocalizedTexts
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    middlewareLocalizedTexts: action.payload as ILiveChatWidgetLocalizedTexts
                }
            };

        case LiveChatWidgetActionType.SET_GLOBAL_DIR:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    globalDir: (action.payload as string) === "ltr" || (action.payload as string) === "rtl" ? action.payload : "ltr"
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    globalDir: (action.payload as string) === "ltr" || (action.payload as string) === "rtl" ? action.payload : "ltr"
                }
            };

        case LiveChatWidgetActionType.SET_MINIMIZED:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    isMinimized: action.payload as boolean
                }

            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    isMinimized: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_CONVERSATION_STATE:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    conversationState: action.payload as ConversationState
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    conversationState: action.payload as ConversationState
                }
            };

        case LiveChatWidgetActionType.SET_START_CHAT_FAILING:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    startChatFailed: action.payload as boolean
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    startChatFailed: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    startChatFailureType: action.payload as StartChatFailureType
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    startChatFailureType: action.payload as StartChatFailureType
                }
            };

        case LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    outsideOperatingHours: action.payload as boolean
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    outsideOperatingHours: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    preChatSurveyResponse: action.payload as string
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    preChatSurveyResponse: action.payload as string
                }
            };

        case LiveChatWidgetActionType.SET_CUSTOM_CONTEXT:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    customContext: action.payload as any
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    customContext: action.payload as any
                }
            };

        case LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    previousElementIdOnFocusBeforeModalOpen: action.payload as string | null
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    previousElementIdOnFocusBeforeModalOpen: action.payload as string | null
                }
            };

        case LiveChatWidgetActionType.SET_SHOW_CONFIRMATION:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    showConfirmationPane: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    showConfirmationPane: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    postChatContext: action.payload as any
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    postChatContext: action.payload as any
                }
            };

        case LiveChatWidgetActionType.SHOW_CALLING_CONTAINER:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    showCallingPopup: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    showCallingPopup: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_INCOMING_CALL:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    isIncomingCall: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    isIncomingCall: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_FOCUS_CHAT_BUTTON:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    focusChatButton: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    focusChatButton: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.DISABLE_VIDEO_CALL:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    disableVideoCall: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    disableVideoCall: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    disableSelfVideo: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    disableSelfVideo: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.DISABLE_REMOTE_VIDEO:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    disableRemoteVideo: action.payload as boolean
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    disableRemoteVideo: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_CHAT_TOKEN:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    chatToken: action.payload as any
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    chatToken: action.payload as any
                }
            };

        case LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE:
            inMemory = {
                ...inMemory,
                uiStates: {
                    ...inMemory.uiStates,
                    showEmailTranscriptPane: action.payload as boolean,
                }
            };
            return {
                ...state,
                uiStates: {
                    ...state.uiStates,
                    showEmailTranscriptPane: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_PRECHAT_RESPONSE_EMAIL:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    preChatResponseEmail: action.payload as string
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    preChatResponseEmail: action.payload as string
                }
            };

        case LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    isAudioMuted: action.payload as boolean
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    isAudioMuted: action.payload as boolean | null
                }
            };

        case LiveChatWidgetActionType.SET_E2VV_ENABLED:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    e2vvEnabled: action.payload as boolean
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    e2vvEnabled: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_START_CHAT_BUTTON_DISPLAY:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    hideStartChatButton: action.payload as boolean
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    hideStartChatButton: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    proactiveChatStates: {
                        ...state.appStates.proactiveChatStates,
                        proactiveChatBodyTitle: action.payload?.proactiveChatBodyTitle as string,
                        proactiveChatEnablePrechat: action.payload?.proactiveChatEnablePrechat as boolean,
                        proactiveChatInNewWindow: action.payload?.proactiveChatInNewWindow as boolean
                    }
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    proactiveChatStates: {
                        ...state.appStates.proactiveChatStates,
                        proactiveChatBodyTitle: action.payload?.proactiveChatBodyTitle as string,
                        proactiveChatEnablePrechat: action.payload?.proactiveChatEnablePrechat as boolean,
                        proactiveChatInNewWindow: action.payload?.proactiveChatInNewWindow as boolean
                    }
                }
            };

        case LiveChatWidgetActionType.SET_TELEMETRY_DATA:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    telemetryInternalData: action.payload as IInternalTelemetryData
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    telemetryInternalData: action.payload as IInternalTelemetryData
                }
            };

        case LiveChatWidgetActionType.SET_RECONNECT_ID:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    reconnectId: action.payload as (string | undefined)
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    reconnectId: action.payload as (string | undefined)
                }
            };

        case LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    unreadMessageCount: action.payload as number
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    unreadMessageCount: action.payload as number
                }
            };

        case LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    liveChatContext: action.payload as any
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    liveChatContext: action.payload as any
                }
            };

        case LiveChatWidgetActionType.SET_WIDGET_STATE:
            inMemory = {
                ...action.payload as ILiveChatWidgetContext
            };
            return {
                ...action.payload as ILiveChatWidgetContext
            };

        case LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    conversationEndedBy: action.payload as ConversationEndEntity
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    conversationEndedBy: action.payload as ConversationEndEntity
                }
            };

        case LiveChatWidgetActionType.SET_WIDGET_SIZE:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    widgetSize: action.payload as any
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    widgetSize: action.payload as any
                }
            };

        case LiveChatWidgetActionType.SET_WIDGET_INSTANCE_ID:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    widgetInstanceId: action.payload as string
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    widgetInstanceId: action.payload as string
                }
            };

        case LiveChatWidgetActionType.SET_LIVE_CHAT_CONFIG:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    liveChatConfig: action.payload as any
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    liveChatConfig: action.payload as any
                }
            };

        case LiveChatWidgetActionType.SET_INITIAL_CHAT_SDK_REQUEST_ID:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    initialChatSdkRequestId: action.payload as string
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    initialChatSdkRequestId: action.payload as string
                }
            };

        case LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    chatDisconnectEventReceived: action.payload as boolean
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    chatDisconnectEventReceived: action.payload as boolean
                }
            };

        case LiveChatWidgetActionType.SET_SURVEY_MODE:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    selectedSurveyMode: action.payload as PostChatSurveyMode
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    selectedSurveyMode: action.payload as PostChatSurveyMode
                }
            };

        case LiveChatWidgetActionType.SET_CONFIRMATION_STATE:
            inMemory = {
                ...inMemory,
                domainStates: {
                    ...inMemory.domainStates,
                    confirmationState: action.payload as ConfirmationState
                }
            };
            return {
                ...state,
                domainStates: {
                    ...state.domainStates,
                    confirmationState: action.payload as ConfirmationState
                }
            };

        case LiveChatWidgetActionType.SET_POST_CHAT_PARTICIPANT_TYPE:
            inMemory = {
                ...inMemory,
                appStates: {
                    ...inMemory.appStates,
                    postChatParticipantType: action.payload as ParticipantType
                }
            };
            return {
                ...state,
                appStates: {
                    ...state.appStates,
                    postChatParticipantType: action.payload as ParticipantType
                }
            };
            
        case LiveChatWidgetActionType.GET_IN_MEMORY_STATE:
            return inMemory;

        default:
            return state;
    }
};