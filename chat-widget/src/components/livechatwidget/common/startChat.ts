import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { ChatSDKError, Constants, LiveWorkItemState } from "../../../common/Constants";
import { createTimer, getStateFromCache, getWidgetCacheIdfromProps, isNullOrEmptyString, isUndefinedOrEmpty } from "../../../common/utils";
import { getAuthClientFunction, handleAuthentication } from "./authHelper";

import { ActivityStreamHandler } from "./ActivityStreamHandler";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { createAdapter } from "./createAdapter";
import { createOnNewAdapterActivityHandler } from "../../../plugins/newMessageEventHandler";
import { handleChatReconnect } from "./reconnectChatHelper";
import { setPostChatContextAndLoadSurvey } from "./setPostChatContextAndLoadSurvey";
import { updateSessionDataForTelemetry } from "./updateSessionDataForTelemetry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let optionalParams: StartChatOptionalParams = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let widgetInstanceId: any | "";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let popoutWidgetInstanceId: any | "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareStartChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    optionalParams = {}; //Resetting to ensure no stale values
    widgetInstanceId = getWidgetCacheIdfromProps(props);

    // reconnect > chat from cache
    await handleChatReconnect(chatSDK, props, dispatch, setAdapter, initStartChat, state);
    // If chat reconnect has kicked in chat state will become Active or Reconnect. So just exit, else go next
    if (state.appStates.conversationState === ConversationState.Active || state.appStates.conversationState === ConversationState.ReconnectChat) {
        return;
    }

    // Check if there is any active popout chats in cache
    if (await canStartPopoutChat(props)) {
        return;
    }

    // Can connect to existing chat session
    if (await canConnectToExistingChat(props, chatSDK, state, dispatch, setAdapter)) {
        return;
    }

    // Setting Proactive chat settings
    const isProactiveChat = state.appStates.conversationState === ConversationState.ProactiveChat;
    const isPreChatEnabledInProactiveChat = state.appStates.proactiveChatStates.proactiveChatEnablePrechat;

    //Setting PreChat and intiate chat
    await setPreChatAndInitiateChat(chatSDK, dispatch, setAdapter, isProactiveChat, isPreChatEnabledInProactiveChat, undefined, props);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setPreChatAndInitiateChat = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, isProactiveChat?: boolean | false, proactiveChatEnablePrechatState?: boolean | false, state?: ILiveChatWidgetContext, props?: ILiveChatWidgetProps) => {
    //Handle reconnect scenario

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
    const optionalParams: StartChatOptionalParams = { isProactiveChat };
    await initStartChat(chatSDK, dispatch, setAdapter, props, optionalParams);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initStartChat = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, props?: ILiveChatWidgetProps, params?: StartChatOptionalParams, persistedState?: any) => {
    let isStartChatSuccessful = false;
    const chatConfig = props?.chatConfig;
    const getAuthToken = props?.getAuthToken;
    const hideErrorUIPane = props?.controlProps?.hideErrorUIPane;
    try {
        //Start widget load timer
        TelemetryTimers.WidgetLoadTimer = createTimer();

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WidgetLoadStarted,
            Description: "Widget loading started",
        });

        const authClientFunction = getAuthClientFunction(chatConfig);
        if (getAuthToken && authClientFunction) {
            // set auth token to chat sdk before start chat
            const authSuccess = await handleAuthentication(chatSDK, chatConfig, getAuthToken);
            if (!authSuccess) {
                // Replacing with error ui
                throw new Error("Authentication was not successful");
            }
        }

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
            // Set custom context params
            await setCustomContextParams(props);
            const defaultOptionalParams: StartChatOptionalParams = {
                sendDefaultInitContext: true,
                isProactiveChat: !!params?.isProactiveChat,
                portalContactId: window.Microsoft?.Dynamic365?.Portal?.User?.contactId
            };
            const startChatOptionalParams: StartChatOptionalParams = Object.assign({}, params, optionalParams, defaultOptionalParams);
            await chatSDK.startChat(startChatOptionalParams);
            isStartChatSuccessful = true;
        } catch (error) {
            TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.StartChatMethodException,
                ExceptionDetails: {
                    exception: `Failed to setup startChat: ${error}`
                }
            });
            isStartChatSuccessful = false;
            throw error;
        }

        // New adapter creation
        const newAdapter = await createAdapter(chatSDK);
        setAdapter(newAdapter);

        const chatToken = await chatSDK.getChatToken();
        dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: chatToken });
        newAdapter?.activity$?.subscribe(createOnNewAdapterActivityHandler(chatToken?.chatId, chatToken?.visitorId));

        // Set app state to Active
        if (isStartChatSuccessful) {
            ActivityStreamHandler.uncork();
            // Update start chat failure app state if chat loads successfully
            dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILING, payload: false });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active });
        }

        if (persistedState) {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_STATE, payload: persistedState });
            await setPostChatContextAndLoadSurvey(chatSDK, dispatch, true);
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const liveChatContext: any = await chatSDK?.getCurrentLiveChatContext();
        dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: liveChatContext });

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WidgetLoadComplete,
            Description: "Widget load complete",
            ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
        });

        // Set post chat context in state
        // Commenting this for now as post chat context is fetched during end chat
        await setPostChatContextAndLoadSurvey(chatSDK, dispatch);

        // Updating chat session detail for telemetry
        await updateSessionDataForTelemetry(chatSDK, dispatch);
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
            return;
        }
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILING, payload: true });
        if (!hideErrorUIPane) {
            // Set app state to failing start chat if hideErrorUI is not turned on
            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.ErrorUIPaneLoaded,
                Description: "Error UI Pane Loaded"
            });
        }
        // Show the loading pane in other cases for failure, this will help for both hideStartChatButton case
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });

        // If sessionInit was successful but LCW startchat failed due to some reason e.g adapter didn't load
        // we need to directly endChat to avoid leaving ghost chats in OC, not disturbing any other UI state 
        if (isStartChatSuccessful === true) {
            await forceEndChat(chatSDK);
        }
    } finally {
        optionalParams = {};
        widgetInstanceId = "";
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const forceEndChat = async (chatSDK: any) => {
    TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
        Event: TelemetryEvent.WidgetLoadFailed,
        ExceptionDetails: {
            Exception: "SessionInit was successful, but widget load failed."
        }
    });
    chatSDK?.endChat();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canConnectToExistingChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    // By pass this function in case of popout chat
    if (state?.appStates?.hideStartChatButton === true) {
        return false;
    }

    const persistedState = getStateFromCache(getWidgetCacheIdfromProps(props));

    //Connect to only active chat session
    if (persistedState &&
        !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
        persistedState?.appStates?.conversationState === ConversationState.Active) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        const optionalParams = { liveChatContext: persistedState?.domainStates?.liveChatContext };
        await initStartChat(chatSDK, dispatch, setAdapter, props, optionalParams, persistedState);
        return true;
    }

    return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setCustomContextParams = async (props?: ILiveChatWidgetProps) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isAuthenticatedChat = (props?.chatConfig?.LiveChatConfigAuthSettings as any)?.msdyn_javascriptclientfunction ? true : false;
    //Should not set custom context for auth chat
    if (isAuthenticatedChat) {
        return;
    }

    if (isNullOrEmptyString(widgetInstanceId)) {
        widgetInstanceId = getWidgetCacheIdfromProps(props);
    }
    // Add custom context only for unauthenticated chat
    const persistedState = getStateFromCache(widgetInstanceId);
    const customContextLocal = persistedState?.domainStates?.customContext ?? props?.initialCustomContext;
    if (customContextLocal) {
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.SettingCustomContext,
            Description: "Setting custom context for unauthenticated chat"
        });

        optionalParams = Object.assign({}, optionalParams, {
            customContext: customContextLocal
        });
    } else {
        const customContextFromParent = await getInitContextParamsForPopout();
        if (!isUndefinedOrEmpty(customContextFromParent?.contextVariables)) {
            optionalParams = Object.assign({}, optionalParams, {
                customContext: customContextFromParent.contextVariables
            });
        }
    }
};

const canStartPopoutChat = async (props: ILiveChatWidgetProps) => {
    if (props.allowSdkChatSupport === false) {
        return false;
    }

    popoutWidgetInstanceId = getWidgetCacheIdfromProps(props, true);

    if (!isNullOrEmptyString(popoutWidgetInstanceId)) {
        const persistedState = getStateFromCache(popoutWidgetInstanceId);

        if (persistedState &&
            !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
            persistedState?.appStates?.conversationState === ConversationState.Active) {
            // Initiate popout chat
            BroadcastService.postMessage({
                eventName: BroadcastEvent.InitiateStartChatInPopoutMode
            });
            return true;
        }
    }
    return false;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkIfConversationStillValid = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, state: ILiveChatWidgetContext): Promise<boolean> => {
    const requestIdFromCache = state.domainStates?.liveChatContext?.requestId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conversationDetails: any = undefined;

    //Preserve current requestId
    const currentRequestId = chatSDK.requestId ?? "";
    dispatch({ type: LiveChatWidgetActionType.SET_INITIAL_CHAT_SDK_REQUEST_ID, payload: currentRequestId });

    try {
        chatSDK.requestId = requestIdFromCache;
        conversationDetails = await chatSDK.getConversationDetails();

        if (Object.keys(conversationDetails).length === 0) {
            chatSDK.requestId = currentRequestId;
            return false;
        }

        if (conversationDetails.state === LiveWorkItemState.Closed || conversationDetails.state === LiveWorkItemState.WrapUp) {
            dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
            chatSDK.requestId = currentRequestId;
            return false;
        }

        return true;
    }
    catch (erorr) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.GetConversationDetailsException,
            ExceptionDetails: {
                exception: `Conversation is not valid: ${erorr}`
            }
        });
        chatSDK.requestId = currentRequestId;
        return false;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getInitContextParamsForPopout = async (): Promise<any> => {
    return window.opener ? await getInitContextParamForPopoutFromOuterScope(window.opener) : null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getInitContextParamForPopoutFromOuterScope = async (scope: any): Promise<any> =>  {
    let payload;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let waitPromiseResolve: any;
    const waitPromise = new Promise((res, rej) => {
        waitPromiseResolve = res;
        setTimeout(() => rej("Failed to find method in outer scope"), 5000);
    }).catch((rej) => console.warn(rej));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getInitContextParamsFromParent = (e: any) => {
        if (e.data && e.data.messageName == Constants.InitContextParamsResponse) {
            payload = e.data.payload;
            waitPromiseResolve();
        }
    };

    window.addEventListener("message", getInitContextParamsFromParent, false);
    scope.postMessage({ messageName: Constants.InitContextParamsResponse }, "*");
    await waitPromise;
    window.removeEventListener("message", getInitContextParamsFromParent, false);
    return payload;
};
export { prepareStartChat, initStartChat, setPreChatAndInitiateChat, checkIfConversationStillValid };