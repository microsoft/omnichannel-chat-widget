import "regenerator-runtime/runtime";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { IReconnectChatContext } from "../../reconnectchatpanestateful/interfaces/IReconnectChatContext";
import { IReconnectChatOptionalParams } from "../../reconnectchatpanestateful/interfaces/IReconnectChatOptionalParams";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { handleAuthentication, removeAuthTokenProvider } from "./authHelper";
import { isNullOrEmptyString, isNullOrUndefined } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChatReconnect = async (chatSDK: any, props: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, initStartChat: any) => {

    if (!isReconnectEnabled(props.chatConfig)) return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAuthenticatedChat = (props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction ? true : false;

    // Get chat reconnect context
    const reconnectChatContext: IReconnectChatContext = await getChatReconnectContext(chatSDK, props.chatConfig, props, isAuthenticatedChat);

    if (hasReconnectId(reconnectChatContext)) {
        //Redirect if enabled
        if (reconnectChatContext.redirectURL) {
            redirectPage(reconnectChatContext.redirectURL, props.reconnectChatPaneProps?.redirectInSameWindow);
            return;
        }

        //if reconnect id is provided in props, don't show reconnect pane
        if (props.reconnectChatPaneProps?.reconnectId && !isNullOrEmptyString(props.reconnectChatPaneProps?.reconnectId)) {
            const reconnectChatContext: IReconnectChatContext = await getChatReconnectContext(chatSDK, props.chatConfig, props, isAuthenticatedChat);
            await setReconnectIdAndStartChat(isAuthenticatedChat, chatSDK, props.chatConfig, props.getAuthToken, dispatch, setAdapter, reconnectChatContext.reconnectId ?? "", initStartChat);
            return;
        }

        //show reconnect pane
        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectChatContext.reconnectId ?? "" });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
        return;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChatReconnectContext = async (chatSDK: any, chatConfig: ChatConfig, props: any, isAuthenticatedChat: boolean) => {
    try {
        const chatReconnectOptionalParams: IReconnectChatOptionalParams = {
            reconnectId: props.reconnectChatPaneProps?.reconnectId
        };
        if (isAuthenticatedChat) {
            // Get auth token for for getting chat reconnect context
            await handleAuthentication(chatSDK, chatConfig, props.getAuthToken);
        }
        const reconnectChatContext = await chatSDK?.getChatReconnectContext(chatReconnectOptionalParams);
        if (isAuthenticatedChat) {
            // remove auth token after reconnectId is fetched
            // this will be reset later at start chat
            removeAuthTokenProvider(chatSDK);
        }
        return reconnectChatContext;
    }
    catch (error) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallFailed,
            ExceptionDetails: {
                exception: error
            }
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setReconnectIdAndStartChat = async (isAuthenticatedChat: boolean, chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, reconnectId: string, initStartChat: any) => {
    if (isAuthenticatedChat) {
        // Get auth token for for getting chat reconnect context
        await handleAuthentication(chatSDK, chatConfig, getAuthToken);
    } else {
        const startUnauthenticatedReconnectChat: ICustomEvent = {
            eventName: BroadcastEvent.StartUnauthenticatedReconnectChat,
        };
        BroadcastService.postMessage(startUnauthenticatedReconnectChat);
    }
    const optionalParams = { reconnectId: reconnectId };
    dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectId });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
    await initStartChat(chatSDK, chatConfig, getAuthToken, dispatch, setAdapter, optionalParams);
};


const redirectPage = (redirectURL: string, redirectInSameWindow: boolean | undefined) => {
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

const isReconnectEnabled = (chatConfig: ChatConfig | undefined) => {
    return chatConfig &&
        chatConfig.LiveWSAndLiveChatEngJoin.msdyn_enablechatreconnect &&
        (chatConfig.LiveWSAndLiveChatEngJoin.msdyn_enablechatreconnect === "true" || chatConfig.LiveWSAndLiveChatEngJoin.msdyn_enablechatreconnect === true);
};

const hasReconnectId = (reconnectAvailabilityResponse: IReconnectChatContext) => {
    return reconnectAvailabilityResponse && !isNullOrUndefined(reconnectAvailabilityResponse.reconnectId);
};

export { handleChatReconnect, isReconnectEnabled, getChatReconnectContext };