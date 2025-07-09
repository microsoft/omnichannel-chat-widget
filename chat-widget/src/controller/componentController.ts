import { ConversationState } from "../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";

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
    const isConversationalSurveyEnabled = state.appStates.isConversationalSurveyEnabled;
    console.log("ADAD shouldShowWebChatContainer() isConversationalSurveyEnabled", state.appStates.isConversationalSurveyEnabled);
    return ((!state.appStates.isMinimized) && state.appStates.conversationState === ConversationState.Active ||
        state.appStates.conversationState === ConversationState.InActive ||
        (state.appStates.conversationState === ConversationState.Postchat && isConversationalSurveyEnabled && state.appStates.isConversationalSurvey)); // ADAD TODO state.appStates.isConversationalSurvey was added
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

export const shouldShowPostChatSurveyPane = (state: ILiveChatWidgetContext) => { // ADAD TODO - remove since no more post chat survey pane (might be okay to leave since will skip entire embed flow if MCS)
    console.log("ADAD shouldShowPostChatSurveyPane() isConversationalSurvey state", state.appStates.isConversationalSurvey);
    console.log("ADAD shouldShowPostChatSurveyPane() conversationState", state.appStates.conversationState);
    // const isSeamlessSurveyFCBEnabled = true;
    // return ((state.appStates.conversationState === ConversationState.Postchat) && !state.appStates.isConversationalSurvey) || !isSeamlessSurveyFCBEnabled; // replace false with isSeamlessSurvey
    return (state.appStates.conversationState === ConversationState.Postchat) && !state.appStates.isConversationalSurvey; // ADAD TODO - do we need to factor in isConversationalSurveyEnabled flag here?
};

export const shouldShowCallingContainer = (state: ILiveChatWidgetContext) => {
    return (state.appStates.conversationState === ConversationState.Active) &&
        state.appStates.e2vvEnabled;
};