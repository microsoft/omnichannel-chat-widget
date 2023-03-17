import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { WebChatStoreLoader } from "../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader";
import { defaultWebChatContainerStatefulProps } from "../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { getWidgetEndChatEventName } from "../../../common/utils";
import { getAuthClientFunction, handleAuthentication } from "./authHelper";
import { checkPostChatEnabled, initiatePostChat } from "./setPostChatContextAndLoadSurvey";
import { ConversationEndEntity } from "../../../contexts/common/ConversationEndEntity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareEndChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any, state: ILiveChatWidgetContext) => {
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
            }
        }
    }
    const isPostChatEnabled = checkPostChatEnabled(props, state);
    if (isPostChatEnabled) {
        try {
            await initiatePostChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, state);
        } catch (error) {
            // Ending chat because something went wrong
            await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
        }
    } else {
        if (state.appStates.conversationEndedBy === ConversationEndEntity.Agent) {
            dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
        } else {
            await endChat(props, chatSDK, setAdapter, setWebChatStyles, dispatch, adapter, false, false, true);
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endChat = async (props: ILiveChatWidgetProps, chatSDK: any, setAdapter: any, setWebChatStyles: any, dispatch: Dispatch<ILiveChatWidgetAction>, adapter: any,
    skipEndChatSDK?: boolean, skipCloseChat?: boolean, postMessageToOtherTab?: boolean) => {
    if (!skipEndChatSDK) {
        try {
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.EndChatSDKCall
            });
            await chatSDK?.endChat();
        } catch (ex) {
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.EndChatSDKCallFailed,
                ExceptionDetails: {
                    exception: ex
                }
            });
            postMessageToOtherTab = false;
        }
    }
    // Need to clear these states immediately when chat ended from OC.
    dispatch({ type: LiveChatWidgetActionType.SET_CUSTOM_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });

    if (!skipCloseChat) {
        try {
            adapter?.end();
            setAdapter(undefined);
            setWebChatStyles({ ...defaultWebChatContainerStatefulProps.webChatStyles, ...props.webChatContainerProps?.webChatStyles });
            WebChatStoreLoader.store = null;
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            dispatch({ type: LiveChatWidgetActionType.SET_POST_CHAT_WORKFLOW_IN_PROGRESS, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_SHOULD_USE_BOT_SURVEY, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY_AGENT_EVENT_RECEIVED, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: undefined });
            dispatch({ type: LiveChatWidgetActionType.SET_AUDIO_NOTIFICATION, payload: null });
            dispatch({
                type: LiveChatWidgetActionType.SET_PROACTIVE_CHAT_PARAMS, payload: {
                    proactiveChatBodyTitle: "",
                    proactiveChatEnablePrechat: false,
                    proactiveChatInNewWindow: false
                }
            });
            if (postMessageToOtherTab) {
                const endChatEventName = getWidgetEndChatEventName(
                    chatSDK?.omnichannelConfig?.orgId,
                    chatSDK?.omnichannelConfig?.widgetId,
                    props?.controlProps?.widgetInstanceId ?? "");
                BroadcastService.postMessage({
                    eventName: endChatEventName
                });
            }
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
        }
    }
};

export { prepareEndChat, endChat };