import { ChatSDKErrorName, ChatSDKError } from "@microsoft/omnichannel-chat-sdk";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { callingStateCleanUp, endChatStateCleanUp, closeChatStateCleanUp, chatSDKStateCleanUp } from "./endChat";
import { NotificationHandler } from "../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler";
import { NotificationScenarios } from "../../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { getWidgetCacheIdfromProps } from "../../../common/utils";
import { WidgetLoadCustomErrorString, WidgetLoadTelemetryMessage } from "../../../common/Constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleStartChatError = (dispatch: Dispatch<ILiveChatWidgetAction>, chatSDK: any, props: ILiveChatWidgetProps | undefined, ex: any, isStartChatSuccessful: boolean) => {
    if (!ex) {
        logWidgetLoadFailed();
        return;
    }

    if (ex instanceof ChatSDKError) {
        if (ex.message === ChatSDKErrorName.WidgetUseOutsideOperatingHour) {
            dispatch({ type: LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS, payload: true });
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
            logWidgetLoadComplete(WidgetLoadTelemetryMessage.OOOHMessage);
            return;
        } else if (ex.message === ChatSDKErrorName.PersistentChatConversationRetrievalFailure ||
            ex.message === ChatSDKErrorName.ConversationInitializationFailure ||
            ex.message === ChatSDKErrorName.ChatTokenRetrievalFailure ||
            ex.message === ChatSDKErrorName.UninitializedChatSDK) {
            if (ex.httpResponseStatusCode === 400) {
                logWidgetLoadFailed(ex);
            } else {
                logWidgetLoadCompleteWithError(ex);
            }
        } else if (ex.message === ChatSDKErrorName.InvalidConversation ||
            ex.message === ChatSDKErrorName.ClosedConversation) {
            logWidgetLoadCompleteWithError(ex);

            // Reset all internal states
            callingStateCleanUp(dispatch);
            endChatStateCleanUp(dispatch);
            closeChatStateCleanUp(dispatch);
            chatSDKStateCleanUp(chatSDK);
            DataStoreManager.clientDataStore?.removeData(getWidgetCacheIdfromProps(props));

            // Starts new chat
            dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
            return;
        } else {
            logWidgetLoadFailed(ex);
        }
    } else if (ex.message === WidgetLoadCustomErrorString.AuthenticationFailedErrorString ||
        ex.message === WidgetLoadCustomErrorString.NetworkErrorString) {
        logWidgetLoadCompleteWithError(ex);
    }

    dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILING, payload: true });
    if (!props?.controlProps?.hideErrorUIPane) {
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
        forceEndChat(chatSDK);
    }
};

const logWidgetLoadFailed = (ex?: ChatSDKError) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exDetails: any = {
        Exception: `Widget load complete with error: ${ex}`
    };
    if (ex?.httpResponseStatusCode) {
        exDetails.HttpResponseStatusCode = ex.httpResponseStatusCode;
    }
    
    TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
        Event: TelemetryEvent.WidgetLoadFailed,
        ExceptionDetails: exDetails,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

export const logWidgetLoadComplete = (additionalMessage?: string) => {
    let descriptionString = "Widget load complete";
    if (additionalMessage) {
        descriptionString += `. ${additionalMessage}`;
    }

    TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
        Event: TelemetryEvent.WidgetLoadComplete,
        Description: descriptionString,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

const logWidgetLoadCompleteWithError = (ex: ChatSDKError) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exDetails: any = {
        Exception: `Widget load complete with error: ${ex}`
    };
    if (ex?.httpResponseStatusCode) {
        exDetails.HttpResponseStatusCode = ex.httpResponseStatusCode;
    }

    TelemetryHelper.logLoadingEvent(LogLevel.WARN, {
        Event: TelemetryEvent.WidgetLoadComplete,
        Description: "Widget load complete with error",
        ExceptionDetails: exDetails,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const forceEndChat = (chatSDK: any) => {
    TelemetryHelper.logLoadingEvent(LogLevel.ERROR, {
        Event: TelemetryEvent.WidgetLoadFailed,
        ExceptionDetails: {
            Exception: "SessionInit was successful, but widget load failed."
        }
    });
    chatSDK?.endChat();
};