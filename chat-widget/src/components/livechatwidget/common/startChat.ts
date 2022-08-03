import { ChatSDKError } from "../../../common/Constants";
import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";
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
import { createTimer, getWidgetCacheId } from "../../../common/utils";
import { getReconnectIdForAuthenticatedChat, handleRedirectUnauthenticatedReconnectChat } from "./reconnectChatHelper";
import { setPostChatContextAndLoadSurvey } from "./setPostChatContextAndLoadSurvey";
import { updateSessionDataForTelemetry } from "./updateSessionDataForTelemetry";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let optionalParams: any = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareStartChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    if (await canConnectToExistingChat(props, chatSDK, state, dispatch, setAdapter)) {
        return;
    }
    // Redirecting if unauthenticated reconnect chat expired
    if (props.reconnectChatPaneProps?.reconnectId) {
        await handleRedirectUnauthenticatedReconnectChat(chatSDK, dispatch, setAdapter, initStartChat, props.reconnectChatPaneProps?.reconnectId, props.reconnectChatPaneProps?.redirectInSameWindow);
    } else {
        // Getting PreChat Survey Context
        const parseToJson = false;
        const preChatSurveyResponse: string = await chatSDK.getPreChatSurvey(parseToJson);
        const showPrechat = state.appStates.conversationState === ConversationState.ProactiveChat ?
            preChatSurveyResponse && state.appStates.proactiveChatStates.proactiveChatEnablePrechat :
            preChatSurveyResponse;
        // Getting reconnectId for authenticated chat
        const reconnectId = await getReconnectIdForAuthenticatedChat(props, chatSDK);
        if (reconnectId) {
            dispatch({ type: LiveChatWidgetActionType.SET_RECONNECT_ID, payload: reconnectId });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.ReconnectChat });
        } else if (showPrechat) {
            dispatch({ type: LiveChatWidgetActionType.SET_PRE_CHAT_SURVEY_RESPONSE, payload: preChatSurveyResponse });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Prechat });
            setCustomContextParams(props, state);
        } else {
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
            setCustomContextParams(props, state);
            await initStartChat(chatSDK, dispatch, setAdapter);
        }
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initStartChat = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, params?: any, persistedState?: any) => {
    try {
        let isStartChatSuccessful = false;
        if (persistedState || params?.liveChatContext) {
            // Broadcasting limited cached chat details
            BroadcastService.postMessage({
                eventName: BroadcastEvent.ChatRetrievedFromCache,
                payload: {
                    chatId: persistedState?.domainStates?.liveChatContext?.chatToken?.chatId,
                    requestId: persistedState?.domainStates?.liveChatContext?.requestId
                }
            });
        }
        try {
            TelemetryTimers.WidgetLoadTimer = createTimer();
            TelemetryHelper.logSDKEvent(LogLevel.INFO, {
                Event: TelemetryEvent.StartChatSDKCall
            });
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
        }
        const newAdapter = await createAdapter(chatSDK);
        setAdapter(newAdapter);

        const chatToken = await chatSDK.getChatToken();
        newAdapter?.activity$?.subscribe(createOnNewAdapterActivityHandler(chatToken?.chatId, chatToken?.visitorId));
        if (!persistedState) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((chatSDK as any)?.getVoiceVideoCalling) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const chatToken: any = await chatSDK?.getChatToken();
                dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: chatToken });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const liveChatContext: any = await chatSDK?.getCurrentLiveChatContext();
            dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: liveChatContext });

            await setPostChatContextAndLoadSurvey(chatSDK, dispatch);

            await updateSessionDataForTelemetry(chatSDK, dispatch);

            // Set app state to Active
            if (isStartChatSuccessful) {
                dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active });
            }
        } else {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_STATE, payload: persistedState });
            await setPostChatContextAndLoadSurvey(chatSDK, dispatch, true);
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
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const canConnectToExistingChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    const widgetStateEventName = getWidgetCacheId(chatSDK?.omnichannelConfig?.orgId ?? "", chatSDK?.omnichannelConfig?.widgetId ?? "");
    const widgetStateFromCache = DataStoreManager.clientDataStore?.getData(widgetStateEventName, "localStorage");
    const persistedState = widgetStateFromCache ? JSON.parse(widgetStateFromCache) : undefined;
    if (persistedState?.domainStates?.liveChatContext) {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        const optionalParams = { liveChatContext: persistedState?.domainStates?.liveChatContext };
        await initStartChat(chatSDK, dispatch, setAdapter, optionalParams, persistedState);
        return true;
    } else {
        return false;
    }
};

const setCustomContextParams = (props: ILiveChatWidgetProps, state: ILiveChatWidgetContext) => {
    // Add custom context if any only for unauthenticated chat
    if (!props.chatConfig?.LiveChatConfigAuthSettings && state.domainStates?.customContext) {
        optionalParams = Object.assign({}, optionalParams, {
            customContext: state.domainStates.customContext
        });
    }
};

export { prepareStartChat, initStartChat };