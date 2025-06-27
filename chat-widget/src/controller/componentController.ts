import { ConversationState } from "../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../contexts/common/ILiveChatWidgetContext";

// Add a timestamp to logs for tracking sequence of events
const getLogTimestamp = () => {
    return new Date().toISOString();
};

export const shouldShowChatButton = (state: ILiveChatWidgetContext) => {
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowChatButton input`, {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState,
        hideStartChatButton: state?.appStates?.hideStartChatButton
    });
    
    const result = (state.appStates.isMinimized ||
        (state.appStates.conversationState === ConversationState.Closed))
        && state?.appStates?.hideStartChatButton === false; // Do not show chat button in case of popout
    
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowChatButton result`, result);
    return result;
};

export const shouldShowProactiveChatPane = (state: ILiveChatWidgetContext) => {
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowProactiveChatPane input`, {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.ProactiveChat);
    
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowProactiveChatPane result`, result);
    return result;
};

export const shouldShowHeader = (state: ILiveChatWidgetContext) => {
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowHeader input`, {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState !== ConversationState.Closed &&
            state.appStates.conversationState !== ConversationState.ProactiveChat);
    
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowHeader result`, result);
    return result;
};

export const shouldShowFooter = (state: ILiveChatWidgetContext) => {
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowFooter input`, {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Active ||
            state.appStates.conversationState === ConversationState.InActive ||
            state.appStates.conversationState === ConversationState.Postchat);
    
    console.log(`ComponentCtrl [${getLogTimestamp()}]: shouldShowFooter result`, result);
    return result;
};

export const shouldShowEmailTranscriptPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowEmailTranscriptPane input", {
        showEmailTranscriptPane: state.uiStates.showEmailTranscriptPane
    });
    
    const result = state.uiStates.showEmailTranscriptPane;
    
    console.log("ComponentCtrl: shouldShowEmailTranscriptPane result", result);
    return result;
};

export const shouldShowWebChatContainer = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowWebChatContainer input", {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = ((!state.appStates.isMinimized) && state.appStates.conversationState === ConversationState.Active ||
        state.appStates.conversationState === ConversationState.InActive);
    
    console.log("ComponentCtrl: shouldShowWebChatContainer result", result);
    return result;
};

export const shouldShowLoadingPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowLoadingPane input", {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Loading);
    
    console.log("ComponentCtrl: shouldShowLoadingPane result", result);
    return result;
};

export const shouldShowStartChatErrorPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowStartChatErrorPane input", {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.Error);
    
    console.log("ComponentCtrl: shouldShowStartChatErrorPane result", result);
    return result;
};

export const shouldShowReconnectChatPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowReconnectChatPane input", {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.ReconnectChat);
    
    console.log("ComponentCtrl: shouldShowReconnectChatPane result", result);
    return result;
};

export const shouldShowPostChatLoadingPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowPostChatLoadingPane input", {
        isMinimized: state.appStates.isMinimized,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.conversationState === ConversationState.PostchatLoading);
    
    console.log("ComponentCtrl: shouldShowPostChatLoadingPane result", result);
    return result;
};

export const shouldShowOutOfOfficeHoursPane = (state: ILiveChatWidgetContext) => {
    // Show OOOH pane only when the conversation state is Closed and outside operating hours is true
    console.log("ComponentCtrl: shouldShowOutOfOfficeHoursPane input", {
        isMinimized: state.appStates.isMinimized,
        outsideOperatingHours: state.appStates.outsideOperatingHours,
        conversationState: state.appStates.conversationState
    });
    
    const result = !state.appStates.isMinimized &&
        (state.appStates.outsideOperatingHours === true) && (state.appStates.conversationState === ConversationState.OutOfOffice);
    
    console.log("ComponentCtrl: shouldShowOutOfOfficeHoursPane result", result);
    return result;
};

export const shouldShowPreChatSurveyPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowPreChatSurveyPane input", {
        conversationState: state.appStates.conversationState
    });
    
    const result = (state.appStates.conversationState === ConversationState.Prechat);
    
    console.log("ComponentCtrl: shouldShowPreChatSurveyPane result", result);
    return result;
};

export const shouldShowConfirmationPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowConfirmationPane input", {
        showConfirmationPane: state.uiStates.showConfirmationPane
    });
    
    const result = state.uiStates.showConfirmationPane;
    
    console.log("ComponentCtrl: shouldShowConfirmationPane result", result);
    return result;
};

export const shouldShowPostChatSurveyPane = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowPostChatSurveyPane input", {
        conversationState: state.appStates.conversationState
    });
    
    const result = (state.appStates.conversationState === ConversationState.Postchat);
    
    console.log("ComponentCtrl: shouldShowPostChatSurveyPane result", result);
    return result;
};

export const shouldShowCallingContainer = (state: ILiveChatWidgetContext) => {
    console.log("ComponentCtrl: shouldShowCallingContainer input", {
        conversationState: state.appStates.conversationState,
        e2vvEnabled: state.appStates.e2vvEnabled
    });
    
    const result = (state.appStates.conversationState === ConversationState.Active) &&
        state.appStates.e2vvEnabled;
    
    console.log("ComponentCtrl: shouldShowCallingContainer result", result);
    return result;
};