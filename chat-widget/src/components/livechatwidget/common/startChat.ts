import { ChatSDKError } from "../../../common/Constants";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import ChatConfig from "@microsoft/omnichannel-chat-sdk/lib/core/ChatConfig";
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
import { setPostChatContextAndLoadSurvey } from "./setPostChatContextAndLoadSurvey";
import { updateSessionDataForTelemetry } from "./updateSessionDataForTelemetry";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ActivityStreamHandler } from "./ActivityStreamHandler";
import { getAuthClientFunction, handleAuthentication } from "./authHelper";
import { handleChatReconnect } from "./reconnectChatHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let optionalParams: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let widgetInstanceId: any | "";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareStartChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    optionalParams = {}; //Resetting to ensure no stale values
    widgetInstanceId = props?.controlProps?.widgetInstanceId;

    // Can connect to existing chat session
    if (await canConnectToExistingChat(props, chatSDK, state, dispatch, setAdapter)) {
        return;
    }

    await handleChatReconnect(chatSDK, props, dispatch, setAdapter, initStartChat, state);

    // If chat reconnect has kicked in chat state will become Active or Reconnect. So just exit, else go next
    if (state.appStates.conversationState === ConversationState.Active || state.appStates.conversationState === ConversationState.ReconnectChat) {
        return;
    }

    // Setting Proactive chat settings
    const isProactiveChat = state.appStates.conversationState === ConversationState.ProactiveChat;
    const isPreChatEnabledInProactiveChat = state.appStates.proactiveChatStates.proactiveChatEnablePrechat;

    //Setting PreChat and intiate chat
    setPreChatAndInitiateChat(chatSDK, props.chatConfig, props.getAuthToken, dispatch, setAdapter, isProactiveChat, isPreChatEnabledInProactiveChat);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setPreChatAndInitiateChat = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, isProactiveChat?: boolean | false, proactiveChatEnablePrechatState?: boolean | false, state?: ILiveChatWidgetContext, props?: ILiveChatWidgetProps) => {
    //Handle reconnect scenario
    if (state) {
        await handleChatReconnect(chatSDK, props, dispatch, setAdapter, initStartChat, state);
        // If chat reconnect has kicked in chat state will become Active or Reconnect. So just exit, else go next
        if (state.appStates.conversationState === ConversationState.Active || state.appStates.conversationState === ConversationState.ReconnectChat) {
            return;
        }
    }

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
    await initStartChat(chatSDK, chatConfig, getAuthToken, dispatch, setAdapter);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initStartChat = async (chatSDK: any, chatConfig: ChatConfig | undefined, getAuthToken: ((authClientFunction?: string) => Promise<string | null>) | undefined, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, params?: any, persistedState?: any) => {
    try {
        const authClientFunction = getAuthClientFunction(chatConfig);
        if (getAuthToken && authClientFunction) {
            // set auth token to chat sdk before start chat
            const authSuccess = await handleAuthentication(chatSDK, chatConfig, getAuthToken);
            if (!authSuccess) {
                return;
            }
        }

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

            // Set custom context params
            setCustomContextParams(chatSDK);
            optionalParams = Object.assign({}, params, optionalParams);
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
        setPostChatContextAndLoadSurvey(chatSDK, dispatch);

        // Updating chat session detail for telemetry
        await updateSessionDataForTelemetry(chatSDK, dispatch);

        // Set app state to Active
        if (isStartChatSuccessful) {
            ActivityStreamHandler.uncork();
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
            return;
        }
        // Show the loading pane in other cases for failure, this will help for both hideStartChatButton case
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
    } finally {
        optionalParams = {};
        widgetInstanceId = "";
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canConnectToExistingChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    // By pass this function in case of popout chat
    if (state.appStates.hideStartChatButton === true) {
        return false;
    }

    const persistedState = getStateFromCache(chatSDK?.omnichannelConfig?.orgId,
        chatSDK?.omnichannelConfig?.widgetId, props?.controlProps?.widgetInstanceId ?? "");

    //Connect to only active chat session
    if (persistedState &&
        !isUndefinedOrEmpty(persistedState?.domainStates?.liveChatContext) &&
        persistedState?.appStates?.conversationState === ConversationState.Active) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        const optionalParams = { liveChatContext: persistedState?.domainStates?.liveChatContext };
        await initStartChat(chatSDK, props.chatConfig, props.getAuthToken, dispatch, setAdapter, optionalParams, persistedState);
        return true;
    } else {
        return false;
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setCustomContextParams = (chatSDK: any) => {
    // Add custom context only for unauthenticated chat
    const persistedState = getStateFromCache(chatSDK?.omnichannelConfig?.orgId, chatSDK?.omnichannelConfig?.widgetId, widgetInstanceId ?? "");

    if (!isUndefinedOrEmpty(persistedState?.domainStates?.customContext)) {
        if (persistedState?.domainStates.liveChatConfig?.LiveChatConfigAuthSettings) {
            const errorMessage = "Use of custom context with authenticated chat is deprecated. The chat would not go through.";
            TelemetryHelper.logSDKEvent(LogLevel.WARN, {
                Event: TelemetryEvent.StartChatMethodException,
                ExceptionDetails: {
                    exception: errorMessage
                }
            });
            throw new Error(errorMessage);
        }
        optionalParams = Object.assign({}, optionalParams, {
            customContext: persistedState?.domainStates?.customContext
        });
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkIfConversationStillValid = async (chatSDK: any, props: any, requestId: any): Promise<boolean> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let conversationDetails: any = undefined;

    //For auth chat
    if (props.getAuthToken) {
        const authClientFunction = getAuthClientFunction(props.chatConfig);
        if (props.getAuthToken && authClientFunction) {
            // set auth token to chat sdk before start chat
            const authSuccess = await handleAuthentication(chatSDK, props.chatConfig, props.getAuthToken);
            if (!authSuccess) {
                return false;
            }
        }
    }

    //Preserve old requestId
    const oldRequestId = chatSDK.requestId;
    try {
        chatSDK.requestId = requestId;
        conversationDetails = await chatSDK.getConversationDetails();
        if (Object.keys(conversationDetails).length === 0) {
            chatSDK.requestId = oldRequestId;
            return false;
        }
        if (conversationDetails.state === "Closed" || conversationDetails.state === "WrapUp") {
            chatSDK.requestId = oldRequestId;
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
        chatSDK.requestId = oldRequestId;
        return false;
    }
};
export { prepareStartChat, initStartChat, setPreChatAndInitiateChat, checkIfConversationStillValid };