import "regenerator-runtime/runtime";

import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { ConversationMode, WidgetLoadCustomErrorString } from "../../../common/Constants";
import { checkContactIdError, isNullOrEmptyString, isNullOrUndefined } from "../../../common/utils";
import { removeAuthTokenProvider } from "./authHelper";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IReconnectChatContext } from "../../reconnectchatpanestateful/interfaces/IReconnectChatContext";
import { IReconnectChatOptionalParams } from "../../reconnectchatpanestateful/interfaces/IReconnectChatOptionalParams";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { handleStartChatError } from "./startChatErrorHandler";

// Return value: should start normal chat flow when reconnect is enabled
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChatReconnect = async (facadeChatSDK: FacadeChatSDK, props: ILiveChatWidgetProps, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, initStartChat: any, state: ILiveChatWidgetContext): Promise<boolean> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAuthenticatedChat = (props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction ? true : false;
    // Get chat reconnect context
    const reconnectChatContext: IReconnectChatContext = await getChatReconnectContext(facadeChatSDK, props.chatConfig as ChatConfig, props, isAuthenticatedChat, dispatch) ?? {} as IReconnectChatContext;

    // Redirect if enabled
    if (reconnectChatContext?.redirectURL) {
        redirectPage(reconnectChatContext.redirectURL, props.reconnectChatPaneProps?.redirectInSameWindow as boolean);
        return false;
    }

    if (hasReconnectId(reconnectChatContext)) {
        //if reconnect id is provided in props, or hideReconnectChatPane is true, don't show reconnect pane
        if (props.reconnectChatPaneProps?.reconnectId && !isNullOrEmptyString(props.reconnectChatPaneProps?.reconnectId) ||
            props.controlProps?.hideReconnectChatPane) {
            await setReconnectIdAndStartChat(isAuthenticatedChat, facadeChatSDK, state, props, dispatch, setAdapter, reconnectChatContext.reconnectId ?? "", initStartChat);
            return false;
        }

        //show reconnect pane
        state.appStates.conversationState = ConversationState.ReconnectChat;
        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectChatContext.reconnectId ?? "" });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
        return false;
    }

    // If we have reached this point, it means there is no valid reconnect id or redirectUrl
    // This is a unauth reconnect refresh scenario - returns true so that we can start normal hydration process
    return true;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChatReconnectContext = async (facadeChatSDK: FacadeChatSDK, chatConfig: ChatConfig, props: any, isAuthenticatedChat: boolean, dispatch: Dispatch<ILiveChatWidgetAction>) => {
    try {
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallStarted,
            Description: "Reconnect context SDK call started"
        });

        const chatReconnectOptionalParams: IReconnectChatOptionalParams = {
            reconnectId: props.reconnectChatPaneProps?.reconnectId
        };
        
        const reconnectChatContext = await facadeChatSDK?.getChatReconnectContext(chatReconnectOptionalParams);
        if (isAuthenticatedChat) {
            // remove auth token after reconnectId is fetched
            // AuthToken will be reset later at start chat
            removeAuthTokenProvider(facadeChatSDK.getChatSDK());
        }
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallSucceeded,
            Description: "Reconnect context SDK call succeeded"
        });
        return reconnectChatContext;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error : any ) {
        checkContactIdError(error);
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallFailed,
            ExceptionDetails: {
                exception: error
            }
        });

        // when auth token is not available, propagate the error to stop the execution and ensure error pane is loaded
        if (error?.message == WidgetLoadCustomErrorString.AuthenticationFailedErrorString){
            handleStartChatError(dispatch, facadeChatSDK, props, new Error(WidgetLoadCustomErrorString.AuthenticationFailedErrorString), false);
            throw error;
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setReconnectIdAndStartChat = async (isAuthenticatedChat: boolean, facadeChatSDK: FacadeChatSDK, state: ILiveChatWidgetContext, props: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, reconnectId: string, initStartChat: any) => {
    if (!isAuthenticatedChat) {
        const startUnauthenticatedReconnectChat: ICustomEvent = {
            eventName: BroadcastEvent.StartUnauthenticatedReconnectChat,
        };
        BroadcastService.postMessage(startUnauthenticatedReconnectChat);
    }
    const optionalParams: StartChatOptionalParams = { reconnectId: reconnectId };

    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectId });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
    
    await initStartChat(facadeChatSDK, dispatch, setAdapter, state, props, optionalParams);
};

const redirectPage = (redirectURL: string, redirectInSameWindow: boolean) => {
    const redirectPageRequest: ICustomEvent = {
        eventName: BroadcastEvent.RedirectPageRequest,
        payload: {
            redirectURL: redirectURL
        }
    };
    BroadcastService.postMessage(redirectPageRequest);
    if (redirectInSameWindow) {
        window.location.href = redirectURL;
    }
};

const isReconnectEnabled = (chatConfig?: ChatConfig): boolean => {
    if (chatConfig) {
        const reconnectEnabled = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_enablechatreconnect?.toLowerCase() === "true";
        return reconnectEnabled;
    }
    return false;
};

const isPersistentEnabled = (chatConfig?: ChatConfig): boolean => {
    if (chatConfig) {
        const persistentEnabled = chatConfig.LiveWSAndLiveChatEngJoin?.msdyn_conversationmode?.toLowerCase() === ConversationMode.Persistent;
        return persistentEnabled;
    }
    return false;
};

const hasReconnectId = (reconnectAvailabilityResponse: IReconnectChatContext) => {
    return reconnectAvailabilityResponse && !isNullOrUndefined(reconnectAvailabilityResponse.reconnectId);
};

export { handleChatReconnect, isReconnectEnabled, isPersistentEnabled, getChatReconnectContext };