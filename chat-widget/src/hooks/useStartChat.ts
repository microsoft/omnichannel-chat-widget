import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { checkContactIdError, createTimer, isNullOrUndefined } from "../common/utils";
import { getAuthClientFunction, handleAuthentication } from "../components/livechatwidget/common/authHelper";

import { ActivityStreamHandler } from "../components/livechatwidget/common/ActivityStreamHandler";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ChatSDKError } from "../common/Constants";
import { ConversationState } from "../contexts/common/ConversationState";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "../components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../contexts/common/LiveChatWidgetActionType";
import { NotificationHandler } from "../components/webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../components/webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../common/telemetry/TelemetryManager";
import { createAdapter } from "../components/livechatwidget/common/createAdapter";
import { createOnNewAdapterActivityHandler } from "../plugins/newMessageEventHandler";
import { setPostChatContextAndLoadSurvey } from "../components/livechatwidget/common/setPostChatContextAndLoadSurvey";
import { updateSessionDataForTelemetry } from "../components/livechatwidget/common/updateSessionDataForTelemetry";
import useChatAdapterStore from "./useChatAdapterStore";
import useChatContextStore from "./useChatContextStore";
import useChatSDKStore from "./useChatSDKStore";
import useForceEndChat from "./useForceEndChat";
import useSetCustomContext from "./useSetCustomContext";

const useStartChat = (props: ILiveChatWidgetProps) => {
    const [, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [, setAdapter]: [any, (adapter: any) => void] = useChatAdapterStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chatSDK: any = useChatSDKStore();
    const forceEndChat = useForceEndChat();
    const setCustomContext = useSetCustomContext(props);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function startChat(params?: StartChatOptionalParams, persistedState?: ILiveChatWidgetContext) {
        let isStartChatSuccessful = false;
        const chatConfig = props?.chatConfig;
        const getAuthToken = props?.getAuthToken;
        const hideErrorUIPane = props?.controlProps?.hideErrorUIPane;

        try {
            // Start widget load timer
            TelemetryTimers.WidgetLoadTimer = createTimer();

            TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                Event: TelemetryEvent.WidgetLoadStarted,
                Description: "Widget loading started",
            });

            const authClientFunction = getAuthClientFunction(chatConfig);
            if (getAuthToken && authClientFunction) {
                // set auth token to chat sdk before start chat
                const authSuccess = handleAuthentication(chatSDK, chatConfig, getAuthToken);
                if (!authSuccess) {
                    // Replacing with error ui
                    throw new Error("Authentication was not successful");
                }
            }

            // Check if chat retrieved from cache
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const customContext = await setCustomContext();
                const defaultOptionalParams: StartChatOptionalParams = {
                    sendDefaultInitContext: true,
                    portalContactId: window.Microsoft?.Dynamic365?.Portal?.User?.contactId
                };
                if (!isNullOrUndefined(customContext)) {
                    defaultOptionalParams.customContext = customContext;
                }
                const defaultOptionalParamsToOverride: StartChatOptionalParams = {
                    isProactiveChat: !!params?.isProactiveChat
                };
                const startChatOptionalParams: StartChatOptionalParams = Object.assign({}, defaultOptionalParams, params, defaultOptionalParamsToOverride);
                await chatSDK.startChat(startChatOptionalParams);
                isStartChatSuccessful = true;
            } catch (error) {
                checkContactIdError(error);
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

            // Subscribe to adapter activities
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
                TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.WidgetLoadComplete,
                    Description: "Widget load complete. Persisted state retrieved",
                    ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
                });
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((ex as any).message === ChatSDKError.WidgetUseOutsideOperatingHour) {
                dispatch({ type: LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS, payload: true });
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
                TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.WidgetLoadComplete,
                    Description: "Widget load complete. Widget is OOOH.",
                    ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
                });
                return;
            }

            TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.WidgetLoadFailed,
                ExceptionDetails: {
                    Exception: `Widget load Failed: ${ex}`
                },
                ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
            });
            NotificationHandler.notifyError(NotificationScenarios.Connection, "Start Chat Failed: " + ex);
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
                forceEndChat();
            }
        }
    }

    return startChat;
};

export default useStartChat;