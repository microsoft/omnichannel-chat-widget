import { ChatSDKError } from "../../../common/Constants";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { createAdapter } from "./createAdapter";
import { createOnNewAdapterActivityHandler } from "../../../plugins/newMessageEventHandler";
import { createTimer, getStateFromCache, isUndefinedOrEmpty } from "../../../common/utils";
import { getReconnectIdForAuthenticatedChat, handleRedirectUnauthenticatedReconnectChat } from "./reconnectChatHelper";
import { setPostChatContextAndLoadSurvey } from "./setPostChatContextAndLoadSurvey";
import { updateSessionDataForTelemetry } from "./updateSessionDataForTelemetry";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { IAuthProps } from "../interfaces/IAuthProps";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let optionalParams: any = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareStartChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    optionalParams = {}; //Resetting to ensure no stale values

    // Can connect to existing chat session
    if (await canConnectToExistingChat(props, chatSDK, state, dispatch, setAdapter)) {
        return;
    }

    // Redirecting if unauthenticated reconnect chat expired
    if (props.reconnectChatPaneProps?.reconnectId) {
        await handleRedirectUnauthenticatedReconnectChat(chatSDK, props.authProps, dispatch, setAdapter, initStartChat, props.reconnectChatPaneProps?.reconnectId, props.reconnectChatPaneProps?.redirectInSameWindow);
        return;
    }

    // Getting reconnectId for authenticated chat
    const reconnectId = await getReconnectIdForAuthenticatedChat(props, chatSDK);
    if (reconnectId) {
        dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectId });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
        return;
    }

    // Set custom context params
    setCustomContextParams(props, chatSDK);

    // Setting Proactive chat settings
    const isProactiveChat = state.appStates.conversationState === ConversationState.ProactiveChat;
    const isPreChatEnabledInProactiveChat = state.appStates.proactiveChatStates.proactiveChatEnablePrechat;

    //Setting PreChat and intiate chat
    setPreChatAndInitiateChat(chatSDK, props.authProps, dispatch, setAdapter, isProactiveChat, isPreChatEnabledInProactiveChat);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setPreChatAndInitiateChat = async (chatSDK: any, authProps: IAuthProps | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, isProactiveChat?: boolean | false, proactiveChatEnablePrechatState?: boolean | false) => {
    // Getting prechat Survey Context
    const parseToJson = false;
    const preChatSurveyResponse: string = await chatSDK.getPreChatSurvey(parseToJson);
    const showPrechat = isProactiveChat ? preChatSurveyResponse && proactiveChatEnablePrechatState : preChatSurveyResponse;

    if (showPrechat) {
        dispatch({ type: LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE, payload: preChatSurveyResponse });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Prechat });
        return;
    }

    //Initiate start chat
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
    await initStartChat(chatSDK, authProps, dispatch, setAdapter);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initStartChat = async (chatSDK: any, authProps: IAuthProps | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, params?: any, persistedState?: any) => {
    try {
        let isStartChatSuccessful = false;

        //Check if chat retrieved from cache
        if (persistedState || params?.liveChatContext) {
            BroadcastService.postMessage({
                eventName: BroadcastEvent.ChatRetrievedFromCache,
                payload: {
                    chatId: persistedState?.domainStates?.liveChatContext?.chatToken?.chatId,
                    requestId: persistedState?.domainStates?.liveChatContext?.requestId
                }
            });
        }

        try {
            //Start widget load timer
            TelemetryTimers.WidgetLoadTimer = createTimer();

            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.StartChatSDKCall
            });

            // Set optional params
            optionalParams = Object.assign({}, params, optionalParams);

            // set auth token to chat sdk before start chat
            if (authProps && authProps.setAuthTokenProviderToChatSdk) {
                await authProps.setAuthTokenProviderToChatSdk(chatSDK, authProps.authClientFunction);
            }

            await chatSDK.startChat(optionalParams);
            isStartChatSuccessful = true;
        } catch (error) {
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.StartChatMethodException,
                ExceptionDetails: {
                    exception: `Failed to setup startChat: ${error}`
                }
            });
            isStartChatSuccessful = false;
            // Resetting the widget state to Closed, for recent introduction of OC rate limiting(429 Error) 
            // TODO : How to diplay a proper UI message to customer to try after sometime at this point - cool down scenario
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            return;
        }

        // New adapter creation
        const newAdapter = await createAdapter(chatSDK);
        setAdapter(newAdapter);

        const chatToken = await chatSDK.getChatToken();
        dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: chatToken });
        newAdapter?.activity$?.subscribe(createOnNewAdapterActivityHandler(chatToken?.chatId, chatToken?.visitorId));

        if (persistedState) {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_STATE, payload: persistedState });
            await setPostChatContextAndLoadSurvey(chatSDK, dispatch, true);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveChatContext: any = await chatSDK?.getCurrentLiveChatContext();
        dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: liveChatContext });

        // Set post chat context in state, no survey load
        await setPostChatContextAndLoadSurvey(chatSDK, dispatch);

        // Updating chat session detail for telemetry
        await updateSessionDataForTelemetry(chatSDK, dispatch);

        // Set app state to Active
        if (isStartChatSuccessful) {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active });
        }

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WidgetLoadComplete,
            Description: "Widget load complete",
            ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
        });
    } catch (ex) {
        TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.WidgetLoadFailed,
            ExceptionDetails: {
                Exception: `Widget load Failed: ${ex}`
            }
        });
        NotificationHandler.notifyError(NotificationScenarios.Connection, "Start Chat Failed: " + ex);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((ex as any).message === ChatSDKError.WidgetUseOutsideOperatingHour) {
            dispatch({ type: LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS, payload: true });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
        }
    } finally {
        optionalParams = {};
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canConnectToExistingChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    // By pass this function in case of popout chat
    if (state.appStates.skipChatButtonRendering === true) {
        return false;
    }

    // Cannot connect to existing chat when auth settings enabled
    const isAuthenticationSettingsEnabled = (props.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction ? true : false;
    if (isAuthenticationSettingsEnabled === true) {
        return false;
    }

    const persistedState = getStateFromCache(chatSDK?.omnichannelConfig?.orgId, chatSDK?.omnichannelConfig?.widgetId);

    //Connect to only active chat session
    if (persistedState &&
        !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
        persistedState?.appStates?.conversationState === ConversationState.Active) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        const optionalParams = { liveChatContext: persistedState?.domainStates?.liveChatContext };
        await initStartChat(chatSDK, props.authProps, dispatch, setAdapter, optionalParams, persistedState);
        return true;
    } else {
        return false;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setCustomContextParams = (props: ILiveChatWidgetProps, chatSDK: any) => {
    // Add custom context only for unauthenticated chat
    const persistedState = getStateFromCache(chatSDK?.omnichannelConfig?.orgId, chatSDK?.omnichannelConfig?.widgetId);

    if (!props.chatConfig?.LiveChatConfigAuthSettings && !isUndefinedOrEmpty(persistedState?.domainStates?.customContext)) {
        optionalParams = Object.assign({}, optionalParams, {
            customContext: persistedState?.domainStates?.customContext
        });
    }
};

export { prepareStartChat, initStartChat, setPreChatAndInitiateChat };