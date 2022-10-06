/* eslint-disable indent */

import { ConversationState } from "./common/ConversationState";
import { IInternalTelemetryData } from "../common/telemetry/interfaces/IInternalTelemetryData";
import { ILiveChatWidgetAction } from "./common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "./common/ILiveChatWidgetContext";
import { ILiveChatWidgetLocalizedTexts } from "./common/ILiveChatWidgetLocalizedTexts";
import { IRenderingMiddlewareProps } from "../components/webchatcontainerstateful/interfaces/IRenderingMiddlewareProps";
import { LiveChatWidgetActionType } from "./common/LiveChatWidgetActionType";

export const createReducer = () => {
    const reducer = (state: ILiveChatWidgetContext, action: ILiveChatWidgetAction): ILiveChatWidgetContext => {
        switch (action.type) {
            case LiveChatWidgetActionType.SET_WIDGET_ELEMENT_ID:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        widgetElementId: action.payload as string
                    }
                };

            case LiveChatWidgetActionType.SET_RENDERING_MIDDLEWARE_PROPS:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        renderingMiddlewareProps: action.payload as IRenderingMiddlewareProps
                    }
                };

            case LiveChatWidgetActionType.SET_MIDDLEWARE_LOCALIZED_TEXTS:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        middlewareLocalizedTexts: action.payload as ILiveChatWidgetLocalizedTexts
                    }
                };

            case LiveChatWidgetActionType.SET_GLOBAL_DIR:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        globalDir: (action.payload as string) === "ltr" || (action.payload as string) === "rtl" ? action.payload : "ltr"
                    }
                };

            case LiveChatWidgetActionType.SET_MINIMIZED:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        isMinimized: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_CONVERSATION_STATE:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        conversationState: action.payload as ConversationState
                    }
                };

            case LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        outsideOperatingHours: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        preChatSurveyResponse: action.payload as string
                    }
                };

            case LiveChatWidgetActionType.SET_CUSTOM_CONTEXT:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        customContext: action.payload as any
                    }
                };

            case LiveChatWidgetActionType.SET_PREVIOUS_FOCUSED_ELEMENT_ID:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        previousElementIdOnFocusBeforeModalOpen: action.payload as string | null
                    }
                };

            case LiveChatWidgetActionType.SET_SHOW_CONFIRMATION:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        showConfirmationPane: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_POST_CHAT_CONTEXT:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        postChatContext: action.payload as any
                    }
                };

            case LiveChatWidgetActionType.SHOW_CALLING_CONTAINER:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        showCallingPopup: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_INCOMING_CALL:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        isIncomingCall: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_FOCUS_CHAT_BUTTON:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        focusChatButton: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.DISABLE_VIDEO_CALL:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        disableVideoCall: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.DISABLE_LOCAL_VIDEO:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        disableSelfVideo: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.DISABLE_REMOTE_VIDEO:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        disableRemoteVideo: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_CHAT_TOKEN:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        chatToken: action.payload as any
                    }
                };
            case LiveChatWidgetActionType.SET_SHOW_EMAIL_TRANSCRIPT_PANE:
                return {
                    ...state,
                    uiStates: {
                        ...state.uiStates,
                        showEmailTranscriptPane: action.payload as boolean
                    }
                };
            case LiveChatWidgetActionType.SET_PRECHAT_RESPONSE_EMAIL:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        preChatResponseEmail: action.payload as string
                    }
                };
            case LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        isAudioMuted: action.payload as boolean | null
                    }
                };
            case LiveChatWidgetActionType.SET_E2VV_ENABLED:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        e2vvEnabled: action.payload as boolean
                    }
                };
            case LiveChatWidgetActionType.SET_SKIP_CHAT_BUTTON_RENDERING:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        skipChatButtonRendering: action.payload as boolean
                    }
                };
            case LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS:
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
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        telemetryInternalData: action.payload as IInternalTelemetryData
                    }
                };
            case LiveChatWidgetActionType.SET_RECONNECT_ID:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        reconnectId: action.payload as (string | undefined)
                    }
                };

            case LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        unreadMessageCount: action.payload as number
                    }
                };

            case LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        liveChatContext: action.payload as any
                    }
                };

            case LiveChatWidgetActionType.SET_WIDGET_STATE:
                return {
                    ...action.payload as ILiveChatWidgetContext
                };

            case LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT:
                return {
                    ...state,
                    appStates: {
                        ...state.appStates,
                        conversationEndedByAgent: action.payload as boolean
                    }
                };

            case LiveChatWidgetActionType.SET_WIDGET_SIZE:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        widgetSize: action.payload as any
                    }
                };

            case LiveChatWidgetActionType.SET_WIDGET_INSTANCE_ID:
                return {
                    ...state,
                    domainStates: {
                        ...state.domainStates,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        widgetInstanceId: action.payload as string
                    }
                };

            default:
                return state;
        }
    };

    return reducer;
};