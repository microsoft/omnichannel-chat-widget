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
    console.log("LOPEZ :: header => ", state.appStates.isMinimized, state.appStates.conversationState);
    return !state.appStates.isMinimized &&
        (state.appStates.conversationState !== ConversationState.Closed &&
            state.appStates.conversationState !== ConversationState.ProactiveChat);
};

export const shouldShowFooter = (state: ILiveChatWidgetContext) => {
    console.log("LOPEZ :: shouldShowFooter => ", state.appStates.isMinimized, state.appStates.conversationState);

    return !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Active ||
            state.appStates.conversationState === ConversationState.InActive ||
            state.appStates.conversationState === ConversationState.Postchat);
};

export const shouldShowEmailTranscriptPane = (state: ILiveChatWidgetContext) => {
    return state.uiStates.showEmailTranscriptPane;
};

export const shouldShowWebChatContainer = (state: ILiveChatWidgetContext) => {
    console.log("LOPEZ :: shouldShowWebChatContainer => ", state.appStates.isMinimized, state.appStates.conversationState);
    return ((!state.appStates.isMinimized) && state.appStates.conversationState === ConversationState.Active ||
        state.appStates.conversationState === ConversationState.InActive);
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
    console.log("LOPEZ ::shouldShowOutOfOfficeHoursPane ", state.appStates.isMinimized , state.appStates.outsideOperatingHours, state.appStates.conversationState);
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
    return (state.appStates.conversationState === ConversationState.Postchat);
};

export const shouldShowCallingContainer = (state: ILiveChatWidgetContext) => {
    return (state.appStates.conversationState === ConversationState.Active) &&
        state.appStates.e2vvEnabled;
};