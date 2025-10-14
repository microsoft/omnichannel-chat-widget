import { ChatSDKError, ChatSDKErrorName } from "@microsoft/omnichannel-chat-sdk";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { PrepareEndChatDescriptionConstants, WidgetLoadCustomErrorString, WidgetLoadTelemetryMessage } from "../../../common/Constants";
import { callingStateCleanUp, chatSDKStateCleanUp, closeChatStateCleanUp, endChatStateCleanUp } from "./endChat";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { DataStoreManager } from "../../../common/contextDataStore/DataStoreManager";
import { Dispatch } from "react";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetProps } from "../interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { StartChatFailureType } from "../../../contexts/common/StartChatFailureType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { TelemetryTimers } from "../../../common/telemetry/TelemetryManager";
import { getWidgetCacheIdfromProps } from "../../../common/utils";

// Helper function to check if error is authentication-related
const isAuthenticationError = (errorMessage: string): boolean => {
    return errorMessage === WidgetLoadCustomErrorString.AuthenticationFailedErrorString ||
           errorMessage.startsWith("Authentication Setup Error:") ||
           errorMessage.includes("Token validation failed") ||
           errorMessage.includes("Authentication token");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleStartChatError = (dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK, props: ILiveChatWidgetProps | undefined, ex: any, isStartChatSuccessful: boolean) => {
    if (!ex) {
        logWidgetLoadFailed();
        return;
    }

    // Handle authentication-related errors
    if (isAuthenticationError(ex.message)) {
        dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE, payload: StartChatFailureType.AuthSetupError });
        logWidgetLoadCompleteWithError(ex);
        // Don't return early - let the generic error handling logic handle hideErrorUIPane and telemetry
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
            case ChatSDKErrorName.AuthenticatedChatConversationRetrievalFailure:
                dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE, payload: StartChatFailureType.Unauthorized });
                logWidgetLoadCompleteWithError(ex);
                break;
            case ChatSDKErrorName.InvalidConversation:
            case ChatSDKErrorName.ClosedConversation:
                handleInvalidOrClosedConversation(dispatch, facadeChatSDK, props, ex);
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
        forceEndChat(facadeChatSDK);
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
    if (ex?.exceptionDetails) {
        exDetails.ChatSDKExceptionDetails = ex.exceptionDetails;
    }
    
    TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.ERROR, {
        Event: TelemetryEvent.WidgetLoadFailed,
        Description: "Widget load complete with error",
        ExceptionDetails: exDetails,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

export const logWidgetLoadComplete = (additionalMessage?: string) => {
    let descriptionString = "Widget load complete";
    if (additionalMessage) {
        descriptionString += `. ${additionalMessage}`;
    }

    TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.INFO, {
        Event: TelemetryEvent.WidgetLoadComplete,
        Description: descriptionString,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

export const logStartChatComplete = (additionalMessage?: string) => {
    let descriptionString = "Start chat complete";
    if (additionalMessage) {
        descriptionString += `. ${additionalMessage}`;
    }

    TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
        Event: TelemetryEvent.StartChatComplete,
        Description: descriptionString,
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
    if (ex?.exceptionDetails) {
        exDetails.ChatSDKExceptionDetails = ex.exceptionDetails;
    }

    TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.ERROR, {
        Event: TelemetryEvent.WidgetLoadFailed,
        Description: "Widget load complete with error",
        ExceptionDetails: exDetails,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

export const logWidgetLoadWithUnexpectedError = (ex: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const details = {
        message: ex?.message || "An unexpected error occurred",
        stack: ex?.stack || "No stack trace available"
    };

    let additionalDetails = "";
    try {
        additionalDetails = JSON.stringify(details);
    } catch (error) {
        additionalDetails = "Failed to stringify error details";
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exDetails: any = {
        Exception: `Widget load with unexpected error: ${additionalDetails}`
    };
    if (ex?.httpResponseStatusCode) {
        exDetails.HttpResponseStatusCode = ex.httpResponseStatusCode;
    }

    TelemetryHelper.logLoadingEventToAllTelemetry(LogLevel.ERROR, {
        Event: TelemetryEvent.WidgetLoadFailed,
        Description: "Widget load with unexpected error",
        ExceptionDetails: exDetails,
        ElapsedTimeInMilliseconds: TelemetryTimers?.WidgetLoadTimer?.milliSecondsElapsed
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const forceEndChat = (facadeChatSDK: FacadeChatSDK) => {
    TelemetryHelper.logSDKEvent(LogLevel.INFO, {
        Event: TelemetryEvent.PrepareEndChat,
        Description: PrepareEndChatDescriptionConstants.WidgetLoadFailedAfterSessionInit
    });
    TelemetryHelper.logSDKEvent(LogLevel.INFO, {
        Event: TelemetryEvent.EndChatSDKCall
    });
    facadeChatSDK?.getChatSDK().endChat();
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
        } else {
            // For other authentication-related token retrieval failures, set as AuthSetupError
            dispatch({ type: LiveChatWidgetActionType.SET_START_CHAT_FAILURE_TYPE, payload: StartChatFailureType.AuthSetupError });
        }
        logWidgetLoadCompleteWithError(ex);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleUninitializedChatSDK = (ex: any) => {
    logWidgetLoadCompleteWithError(ex);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleInvalidOrClosedConversation = (dispatch: Dispatch<ILiveChatWidgetAction>, facadeChatSDK: FacadeChatSDK, props: ILiveChatWidgetProps | undefined, ex: any) => {
    logWidgetLoadCompleteWithError(ex);

    // Reset all internal states
    callingStateCleanUp(dispatch);
    endChatStateCleanUp(dispatch);
    closeChatStateCleanUp(dispatch);
    chatSDKStateCleanUp(facadeChatSDK.getChatSDK());
    DataStoreManager.clientDataStore?.removeData(getWidgetCacheIdfromProps(props));

    // Starts new chat
    dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed });
};