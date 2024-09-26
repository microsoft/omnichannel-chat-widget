import { ChatSDKError, ChatSDKErrorName } from "@microsoft/omnichannel-chat-sdk";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { PrepareEndChatDescriptionConstants, WidgetLoadCustomErrorString, WidgetLoadTelemetryMessage } from "../../../common/Constants";
import { callingStateCleanUp, chatSDKStateCleanUp, closeChatStateCleanUp, endChatStateCleanUp } from "./endChat";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";
import { Dispatch } from "react";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { StartChatFailureType } from "../../../contexts/common/StartChatFailureType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { getWidgetCacheIdfromProps } from "../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleStartChatError = (dispatch: Dispatch<ILiveChatWidgetAction>, chatSDK: any, props: ILiveChatWidgetProps | undefined, ex: any, isStartChatSuccessful: boolean) => {
    if (!ex) {
        logWidgetLoadFailed();
        return;
    }

    // Handle internal or misc errors
    if (ex.message === WidgetLoadCustomErrorString.AuthenticationFailedErrorString) {
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE, payload: StartChatFailureType.AuthSetupError });
        // set conversation to error to enforce error UI pane
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Error });

        logWidgetLoadCompleteWithError(ex);
    }
    if (ex.message === WidgetLoadCustomErrorString.NetworkErrorString) {
        logWidgetLoadCompleteWithError(ex);
    }

    // Handle ChatSDK errors
    if (ex instanceof ChatSDKError) {
        switch (ex.message) {
            case ChatSDKErrorName.WidgetUseOutsideOperatingHour:
                handleWidgetUseOutsideOperatingHour(dispatch);
                return;
            case ChatSDKErrorName.PersistentChatConversationRetrievalFailure:
                handlePersistentChatConversationRetrievalFailure(ex);
                break;
            case ChatSDKErrorName.ConversationInitializationFailure:
                handleConversationInitializationFailure(ex);
                break;
            case ChatSDKErrorName.ChatTokenRetrievalFailure:
                handleChatTokenRetrievalFailure(dispatch, ex);
                break;
            case ChatSDKErrorName.UninitializedChatSDK:
                handleUninitializedChatSDK(ex);
                break;
            // Handle the case indicating failure to retrieve an authenticated chat conversation 
            case ChatSDKErrorName.AuthenticatedChatConversationRetrievalFailure:
                logWidgetLoadCompleteWithError(ex);
                break;
            case ChatSDKErrorName.InvalidConversation:
            case ChatSDKErrorName.ClosedConversation:
                handleInvalidOrClosedConversation(dispatch, chatSDK, props, ex);
                return;
            default:
                logWidgetLoadFailed(ex);
        }
    }

    // Show the error UI pane
    dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILING, payload: true });
    if (!props?.controlProps?.hideErrorUIPane) {
        // New flow of leveraging ConversationState.Error
        // Set app state to failing start chat if hideErrorUI is not turned on
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.ErrorUIPaneLoaded,
            Description: "Error UI Pane Loaded"
        });
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Error });
    } else {
        // Old flow of leveraging ConversationState.Loading
        // Show the loading pane in other cases for failure, this will help for both hideStartChatButton case
        dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
    }

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
    TelemetryHelper.logSDKEvent(LogLevel.INFO, {
        Event: TelemetryEvent.PrepareEndChat,
        Description: PrepareEndChatDescriptionConstants.WidgetLoadFailedAfterSessionInit
    });
    TelemetryHelper.logSDKEvent(LogLevel.INFO, {
        Event: TelemetryEvent.EndChatSDKCall
    });
    chatSDK?.endChat();
};

const handleWidgetUseOutsideOperatingHour = (dispatch: Dispatch<ILiveChatWidgetAction>) => {
    dispatch({ type: LiveChatWidgetActionType.SET_OUTSIDE_OPERATING_HOURS, payload: true });
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.OutOfOffice });
    logWidgetLoadComplete(WidgetLoadTelemetryMessage.OOOHMessage);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handlePersistentChatConversationRetrievalFailure = (ex: any) => {
    if (ex.httpResponseStatusCode === 400) {
        logWidgetLoadFailed(ex);
    } else {
        logWidgetLoadCompleteWithError(ex);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleConversationInitializationFailure = (ex: any) => {
    if (ex.httpResponseStatusCode === 400) {
        logWidgetLoadFailed(ex);
    } else {
        logWidgetLoadCompleteWithError(ex);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleChatTokenRetrievalFailure = (dispatch: Dispatch<ILiveChatWidgetAction>, ex: any) => {
    if (ex.httpResponseStatusCode === 400) {
        logWidgetLoadFailed(ex);
    } else {
        if (ex.httpResponseStatusCode === 401) {
            dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE, payload: StartChatFailureType.Unauthorized });
        }
        logWidgetLoadCompleteWithError(ex);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUninitializedChatSDK = (ex: any) => {
    logWidgetLoadCompleteWithError(ex);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleInvalidOrClosedConversation = (dispatch: Dispatch<ILiveChatWidgetAction>, chatSDK: any, props: ILiveChatWidgetProps | undefined, ex: any) => {
    logWidgetLoadCompleteWithError(ex);

    // Reset all internal states
    callingStateCleanUp(dispatch);
    endChatStateCleanUp(dispatch);
    closeChatStateCleanUp(dispatch);
    chatSDKStateCleanUp(chatSDK);
    DataStoreManager.clientDataStore?.removeData(getWidgetCacheIdfromProps(props));

    // Starts new chat
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
};