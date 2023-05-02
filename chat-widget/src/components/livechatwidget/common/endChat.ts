import { ConfirmationState, Constants, ConversationEndEntity } from "../../../common/Constants";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { getAuthClientFunction, handleAuthentication } from "./authHelper";
import { getConversationDetailsCall, getWidgetEndChatEventName, isNullOrEmptyString } from "../../../common/utils";
import { getPostChatContext, initiatePostChat } from "./renderSurveyHelpers";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareEndChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, setWebChatStyles: any, adapter: any, uwid: string) => {
    try {

        const conversationDetails = await getConversationDetailsCall(chatSDK);

        // Use Case : When post chat is not configured
        if (conversationDetails?.canRenderPostChat?.toLowerCase() === Constants.false) {
            // If ended by customer, just close chat
            if (state?.appStates?.conversationEndedBy === ConversationEndEntity.Customer) {
                await endChat(props, chatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, false, true, uwid);
            }
            //Use Case: If ended by Agent, stay chat in InActive state
            return;
        }

        // Use Case : Can render post chat scenarios
        await getPostChatContext(chatSDK, state, dispatch);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const postchatContext: any = state?.domainStates?.postChatContext;

        if (postchatContext === undefined) {
            // For Customer intiated conversations, just close chat widget
            if (state?.appStates?.conversationEndedBy === ConversationEndEntity.Customer) {
                await endChat(props, chatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, false, true, uwid);
                return;
            }

            //For agent initiated end chat, allow to download transcript
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.InActive });
            return;
        }

        endChat(props, chatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, true, true, uwid);

        // Initiate post chat render
        if (state?.domainStates?.postChatContext) {
            await initiatePostChat(props, conversationDetails, state, dispatch);
            return;
        }
    }
    catch (error) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.EndChatFailed,
            ExceptionDetails: {
                exception: JSON.stringify(error)
            }
        });

        //Close chat widget for any failure in embedded to allow to show start chat button
        if (props.controlProps?.hideStartChatButton === false) {
            await endChat(props, chatSDK, state, dispatch, setAdapter, setWebChatStyles, adapter, false, false, true, uwid);
        }
    }
    finally {
        //Chat token clean up
        await chatTokenCleanUp(dispatch);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, setWebChatStyles: any, adapter: any,
    skipEndChatSDK?: boolean, skipCloseChat?: boolean, postMessageToOtherTab?: boolean, uwid = "") => {
    if (!skipEndChatSDK && chatSDK.conversation) {
        try {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.EndChatSDKCall
            });
            //Get auth token again if chat continued for longer time, otherwise gets 401 error
            await handleAuthenticationIfEnabled(props, chatSDK);
            await chatSDK?.endChat();
        } catch (ex) {
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.EndChatSDKCallFailed,
                ExceptionDetails: {
                    exception: ex
                }
            });
            postMessageToOtherTab = false;
        } finally {
            await endChatStateCleanUp(dispatch);
        }
    }

    if (!skipCloseChat) {
        try {
            adapter?.end();
            setAdapter(undefined);
            setWebChatStyles({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
            WebChatStoreLoader.store = null;
            closeChatStateCleanUp(dispatch);
            TelemetryHelper.logActionEvent(LogLevel.INFO, {
                Event: TelemetryEvent.CloseChatCall,
                Description: "Chat was closed succesfully"
            });
        } catch (error) {
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.CloseChatMethodException,
                ExceptionDetails: {
                    exception: `Failed to endChat: ${error}`
                }
            });
        } finally {
            dispatch({ type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT, payload: 0 });
            // Always allow to close the chat for embedded mode irrespective of end chat errors
            closeChatWidget(dispatch, props, state);
        }
    }

    if (postMessageToOtherTab && !isNullOrEmptyString(uwid)) {
        const endChatEventName = await getEndChatEventName(chatSDK, props);
        BroadcastService.postMessage({
            eventName: endChatEventName,
            payload: uwid
        });
    }
};

const endChatStateCleanUp = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    // Need to clear these states immediately when chat ended from OC.
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_DISCONNECT_EVENT_RECEIVED, payload: false });
};

const closeChatStateCleanUp = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    // dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.NotSet });
    dispatch({ type: LiveChatWidgetActionType.SET_CONFIRMATION_STATE, payload: ConfirmationState.NotSet });
    dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILING, payload: false });
    dispatch({
        type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
            proactiveChatBodyTitle: "",
            proactiveChatEnablePrechat: false,
            proactiveChatInNewWindow: false
        }
    });
};

const closeChatWidget = (dispatch: Dispatch<ILiveChatWidgetAction>, props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    if (state?.appStates?.hideStartChatButton) {
        // Only close chat if header is enabled for popout
        // TODO : This condition needs to be removed eventually when the filler UX is ready for popout, removing this condition would show a blank screen for OOB Widget
        if (props?.controlProps?.hideHeader === undefined || props?.controlProps?.hideHeader === false) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
        }
        return;
    }

    // Embedded chat
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleAuthenticationIfEnabled = async (props: ILiveChatWidgetProps, chatSDK: any) => {
    //Unable to end chat if token has expired
    if (props.getAuthToken) {
        const authClientFunction = getAuthClientFunction(props.chatConfig);
        if (props.getAuthToken && authClientFunction) {
            // set auth token to chat sdk before end chat
            const authSuccess = await handleAuthentication(chatSDK, props.chatConfig, props.getAuthToken);
            if (!authSuccess) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.GetAuthTokenFailed,
                    ExceptionDetails: {
                        exception: "Unable to get auth token during end chat"
                    }
                });
                throw new Error("handleAuthenticationIfEnabled:Failed to get authentication token");
            }
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const chatTokenCleanUp = async (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    //Just do cleanup here
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getEndChatEventName = async (chatSDK: any, props: ILiveChatWidgetProps) => {
    return getWidgetEndChatEventName(
        chatSDK?.omnichannelConfig?.orgId,
        chatSDK?.omnichannelConfig?.widgetId,
        props?.controlProps?.widgetInstanceId ?? "");
};

export { prepareEndChat, endChat };