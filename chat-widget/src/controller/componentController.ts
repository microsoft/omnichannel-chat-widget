import { ConversationState } from "../contexts/common/ConversationState";
import { ExtendedChatConfig } from "../components/webchatcontainerstateful/interfaces/IExtendedChatConffig";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";
import { shouldLoadPersistentChatHistory } from "../components/livechatwidget/common/liveChatConfigUtils";

export const shouldShowChatButton = (state: ILiveChatWidgetContext) => {
    return (state.appStates.isMinimized ||
        (state.appStates.conversationState === ConversationState.Closed))
        && state?.appStates?.hideStartChatButton === false; // Do not show chat button in case of popout
};

export const shouldShowProactiveChatPane = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.ProactiveChat);
};

export const shouldShowHeader = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState !== ConversationState.Closed &&
            state.appStates.conversationState !== ConversationState.ProactiveChat);
};

export const shouldShowFooter = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Active ||
            state.appStates.conversationState === ConversationState.InActive ||
            state.appStates.conversationState === ConversationState.Postchat);
};

export const shouldShowEmailTranscriptPane = (state: ILiveChatWidgetContext) => {
    return state.uiStates.showEmailTranscriptPane;
};

export const shouldShowWebChatContainer = (state: ILiveChatWidgetContext) => {
    const extendedChatConfig = state?.domainStates?.liveChatConfig as ExtendedChatConfig | undefined;
    const persistentHistoryEnabled = shouldLoadPersistentChatHistory(extendedChatConfig);

    const isActiveOrInactive = state.appStates.conversationState === ConversationState.Active ||
        state.appStates.conversationState === ConversationState.InActive;
    const isPostchatSurvey = state.appStates.conversationState === ConversationState.Postchat &&
        state.appStates.isConversationalSurveyEnabled && state.appStates.isConversationalSurvey;

    if (persistentHistoryEnabled) {
        // Keep WebChat in DOM even when minimized (CSS hides it via visibility)
        // This preserves scroll position across minimize/maximize cycles
        return isActiveOrInactive || isPostchatSurvey;
    }
    // Original behavior - hide WebChat when minimized
    return (!state.appStates.isMinimized) && (isActiveOrInactive || isPostchatSurvey);
};

export const shouldShowLoadingPane = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Loading);
};

export const shouldShowStartChatErrorPane = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Error);
};

export const shouldShowReconnectChatPane = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.ReconnectChat);
};

export const shouldShowPostChatLoadingPane = (state: ILiveChatWidgetContext) => {
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.PostchatLoading);
};

export const shouldShowOutOfOfficeHoursPane = (state: ILiveChatWidgetContext) => {
    // Show OOOH pane only when the conversation state is Closed and outside operating hours is true
    return !state.appStates.isMinimized &&
        (state.appStates.outsideOperatingHours === true) && (state.appStates.conversationState === ConversationState.OutOfOffice);
};

export const shouldShowPreChatSurveyPane = (state: ILiveChatWidgetContext) => {
    return (state.appStates.conversationState === ConversationState.Prechat);
};

export const shouldShowConfirmationPane = (state: ILiveChatWidgetContext) => {
    return state.uiStates.showConfirmationPane;
};

export const shouldShowPostChatSurveyPane = (state: ILiveChatWidgetContext) => {
    return (state.appStates.conversationState === ConversationState.Postchat) && !state.appStates.isConversationalSurvey;
};

export const shouldShowCallingContainer = (state: ILiveChatWidgetContext) => {
    return (state.appStates.conversationState === ConversationState.Active) &&
        state.appStates.e2vvEnabled;
};