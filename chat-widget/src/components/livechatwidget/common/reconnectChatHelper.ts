import "regenerator-runtime/runtime";

import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { checkContactIdError, isNullOrEmptyString, isNullOrUndefined } from "../../../common/utils";
import { handleAuthentication, removeAuthTokenProvider } from "./authHelper";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { IReconnectChatContext } from "../../reconnectchatpanestateful/interfaces/IReconnectChatContext";
import { IReconnectChatOptionalParams } from "../../reconnectchatpanestateful/interfaces/IReconnectChatOptionalParams";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChatReconnect = async (chatSDK: any, props: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, initStartChat: any, state: ILiveChatWidgetContext) => {

    if (!isReconnectEnabled(props.chatConfig)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAuthenticatedChat = (props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction ? true : false;

    // Get chat reconnect context
    const reconnectChatContext: IReconnectChatContext = await getChatReconnectContext(chatSDK, props.chatConfig, props, isAuthenticatedChat);

    //Redirect if enabled
    if (reconnectChatContext?.redirectURL) {
        redirectPage(reconnectChatContext.redirectURL, props.reconnectChatPaneProps?.redirectInSameWindow);
        return;
    }

    if (hasReconnectId(reconnectChatContext)) {
        //if reconnect id is provided in props, don't show reconnect pane
        if (props.reconnectChatPaneProps?.reconnectId && !isNullOrEmptyString(props.reconnectChatPaneProps?.reconnectId)) {
            await setReconnectIdAndStartChat(isAuthenticatedChat, chatSDK, props, dispatch, setAdapter, reconnectChatContext.reconnectId ?? "", initStartChat);
            return;
        }

        //show reconnect pane
        state.appStates.conversationState = ConversationState.ReconnectChat;
        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectChatContext.reconnectId ?? "" });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
        return;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChatReconnectContext = async (chatSDK: any, chatConfig: ChatConfig, props: any, isAuthenticatedChat: boolean) => {
    try {
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallStarted,
            Description: "Reconnect context SDK call started"
        });

        const chatReconnectOptionalParams: IReconnectChatOptionalParams = {
            reconnectId: props.reconnectChatPaneProps?.reconnectId
        };
        // Get auth token for getting chat reconnect context
        if (isAuthenticatedChat) {
            await handleAuthentication(chatSDK, chatConfig, props.getAuthToken);
        }
        const reconnectChatContext = await chatSDK?.getChatReconnectContext(chatReconnectOptionalParams);
        if (isAuthenticatedChat) {
            // remove auth token after reconnectId is fetched
            // AuthToken will be reset later at start chat
            removeAuthTokenProvider(chatSDK);
        }
        return reconnectChatContext;
    }
    catch (error) {
        checkContactIdError(error);
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallFailed,
            ExceptionDetails: {
                exception: error
            }
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setReconnectIdAndStartChat = async (isAuthenticatedChat: boolean, chatSDK: any, props: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, reconnectId: string, initStartChat: any) => {
    if (!isAuthenticatedChat) {
        const startUnauthenticatedReconnectChat: ICustomEvent = {
            eventName: BroadcastEvent.StartUnauthenticatedReconnectChat,
        };
        BroadcastService.postMessage(startUnauthenticatedReconnectChat);
    }
    const optionalParams: StartChatOptionalParams = { reconnectId: reconnectId };

    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectId });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });

    await initStartChat(chatSDK, dispatch, setAdapter, props, optionalParams);
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

const hasReconnectId = (reconnectAvailabilityResponse: IReconnectChatContext) => {
    return reconnectAvailabilityResponse && !isNullOrUndefined(reconnectAvailabilityResponse.reconnectId);
};

export { handleChatReconnect, isReconnectEnabled, getChatReconnectContext };