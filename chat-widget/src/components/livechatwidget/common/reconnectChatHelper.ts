import "regenerator-runtime/runtime";

import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
import AuthSettings from "@microsoft/omnichannel-chat-sdk/lib/core/AuthSettings";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { IReconnectChatContext } from "../../reconnectchatpanestateful/interfaces/IReconnectChatContext";
import { IReconnectChatOptionalParams } from "../../reconnectchatpanestateful/interfaces/IReconnectChatOptionalParams";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getChatReconnectContext = async (chatSDK: any, reconnectId?: string) => {
    try {
        if (reconnectId) {
            const chatReconnectOptionalParams: IReconnectChatOptionalParams = {
                reconnectId: reconnectId
            };
            return await chatSDK?.getChatReconnectContext(chatReconnectOptionalParams);
        } else {
            return await chatSDK?.getChatReconnectContext();
        }
    } catch (ex) {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetChatReconnectContextSDKCallFailed,
            ExceptionDetails: {
                exception: ex
            }
        });
    }
    return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getReconnectIdForAuthenticatedChat = async (props: ILiveChatWidgetProps, chatSDK: any) => {
    let authClientFunction = undefined;
    if (props.chatConfig?.LiveChatConfigAuthSettings) {
        authClientFunction = (props.chatConfig?.LiveChatConfigAuthSettings as AuthSettings)?.msdyn_javascriptclientfunction ?? undefined;
    }
    if (props.reconnectChatPaneProps?.isReconnectEnabled
        && authClientFunction
    // TODO: Implement this after storage is in place
    /* && !isLoadWithState() */) {
        const previousActiveSessionResponse: IReconnectChatContext = await getChatReconnectContext(chatSDK);
        if (previousActiveSessionResponse && previousActiveSessionResponse.reconnectId) {
            return previousActiveSessionResponse.reconnectId;
        }
    }
    return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUnauthenticatedReconnectChat = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, reconnectId: string, initStartChat: any, redirectInSameWindow: boolean | undefined) => {
    const reconnectAvailabilityResponse: IReconnectChatContext = await getChatReconnectContext(chatSDK, reconnectId);
    if (shouldRedirectOrStartNewChat(reconnectAvailabilityResponse)) {
        await redirectOrStartNewChat(reconnectAvailabilityResponse, chatSDK, chatConfig, getAuthToken, dispatch, setAdapter, initStartChat, redirectInSameWindow);
    } else {
        await setReconnectIdAndStartChat(chatSDK, chatConfig, getAuthToken, dispatch, setAdapter, reconnectId, initStartChat);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const startUnauthenticatedReconnectChat = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, reconnectId: string, initStartChat: any) => {
    const reconnectAvailabilityResponse: IReconnectChatContext = await getChatReconnectContext(chatSDK, reconnectId);
    if (!shouldRedirectOrStartNewChat(reconnectAvailabilityResponse)) {
        await setReconnectIdAndStartChat(chatSDK, chatConfig, getAuthToken, dispatch, setAdapter, reconnectId, initStartChat);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setReconnectIdAndStartChat = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, reconnectId: string, initStartChat: any) => {
    const startUnauthenticatedReconnectChat: ICustomEvent = {
        eventName: BroadcastEvent.StartUnauthenticatedReconnectChat,
    };
    BroadcastService.postMessage(startUnauthenticatedReconnectChat);
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

const shouldRedirectOrStartNewChat = (reconnectAvailabilityResponse: IReconnectChatContext) => {
    return reconnectAvailabilityResponse && !reconnectAvailabilityResponse.reconnectId;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const startNewChatEmptyRedirectionUrl = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, initStartChat: any) => {
    const startUnauthenticatedReconnectChat: ICustomEvent = {
        eventName: BroadcastEvent.StartUnauthenticatedReconnectChat,
    };
    BroadcastService.postMessage(startUnauthenticatedReconnectChat);
    // Getting PreChat Survey Context
    const parseToJson = false;
    const preChatSurveyResponse: string = await chatSDK.getPreChatSurvey(parseToJson);
    if (preChatSurveyResponse) {
        dispatch({ type: LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE, payload: preChatSurveyResponse });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Prechat });
    } else {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        await initStartChat(chatSDK, chatConfig, getAuthToken, dispatch, setAdapter);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRedirectUnauthenticatedReconnectChat = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, initStartChat: any, reconnectId: string, redirectInSameWindow: boolean | undefined) => {
    const reconnectAvailabilityResponse: IReconnectChatContext = await getChatReconnectContext(chatSDK, reconnectId);
    if (shouldRedirectOrStartNewChat(reconnectAvailabilityResponse)) {
        await redirectOrStartNewChat(reconnectAvailabilityResponse, chatSDK, chatConfig, getAuthToken, dispatch, setAdapter, initStartChat, redirectInSameWindow);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const redirectOrStartNewChat = async (reconnectAvailabilityResponse: IReconnectChatContext, chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, initStartChat: any, redirectInSameWindow: boolean | undefined) => {
    if (reconnectAvailabilityResponse.redirectURL) {
        redirectPage(reconnectAvailabilityResponse.redirectURL, redirectInSameWindow);
    } else {
        await startNewChatEmptyRedirectionUrl(chatSDK, chatConfig, getAuthToken, dispatch, setAdapter, initStartChat);
    }
};

export { getChatReconnectContext, getReconnectIdForAuthenticatedChat, handleUnauthenticatedReconnectChat, startUnauthenticatedReconnectChat, handleRedirectUnauthenticatedReconnectChat };