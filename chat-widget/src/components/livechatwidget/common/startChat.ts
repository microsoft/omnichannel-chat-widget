import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { ChatSDKError } from "../../../common/Constants";
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
import { createTimer } from "../../../common/utils";
import { getReconnectIdForAuthenticatedChat } from "./reconnectChatHelper";
import { updateSessionDataForTelemetry } from "./updateSessionDataForTelemetry";
import { setPostChatContextAndLoadSurvey } from "./setPostChatContextAndLoadSurvey";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prepareStartChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    if (await canConnectToExistingChat(props, chatSDK, state, dispatch, setAdapter)) {
        return;
    }

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
    } else {
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        await initStartChat(chatSDK, dispatch, setAdapter);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initStartChat = async (chatSDK: any, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any, params?: any, persistedState?: any) => {
    try {
        try {
            TelemetryHelper.logConfigDataEvent(LogLevel.INFO, {
                Event: TelemetryEvent.StartChatSDKCall
            });
            await chatSDK.startChat(params);
            TelemetryTimers.WidgetLoadTimer = createTimer();
        } catch (error) {
            TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.StartChatMethodException,
                ExceptionDetails: {
                    exception: `Failed to setup startChat: ${error}`
                }
            });
        }
        const newAdapter = await createAdapter(chatSDK);
        setAdapter(newAdapter);

        if (!persistedState) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((chatSDK as any)?.getVoiceVideoCalling) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const chatToken: any = await chatSDK?.getChatToken();
                dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: chatToken });
            }
            await setPostChatContextAndLoadSurvey(chatSDK, dispatch);

            await updateSessionDataForTelemetry(chatSDK, dispatch);

            // Set app state to Active
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active });
        } else {
            dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_STATE, payload: persistedState });
            console.log(persistedState?.domainStates?.postChatContext);
            await setPostChatContextAndLoadSurvey(chatSDK, dispatch, true);
        }

        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.WidgetLoadComplete,
            Description: "Widget load complete",
            ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
        });
    } catch (ex) {
        TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.StartChatFailed,
            ExceptionDetails: {
                Exception: `Start Chat Failed: ${ex}`
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

const canConnectToExistingChat = async (props: ILiveChatWidgetProps, chatSDK: any, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, setAdapter: any) => {
    const widgetStateFromCache = DataStoreManager.browserDataStore?.getData(TelemetryEvent.ChatWidgetStateChanged, "localStorage");
    const persistedState = widgetStateFromCache ? JSON.parse(widgetStateFromCache) : undefined;

    if (persistedState?.domainStates?.chatToken) {
        const optionalParams = { liveChatContext: { chatToken: persistedState?.domainStates?.chatToken } };
        console.log(JSON.stringify(optionalParams));
        await initStartChat(chatSDK, dispatch, setAdapter, optionalParams, persistedState);
        return true;
    } else {
        return false;
    }
};

export { prepareStartChat, initStartChat };