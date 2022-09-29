export interface ILiveChatWidgetControlProps {
    id?: string;
    dir?: "rtl" | "ltr";
    hideCallingContainer?: boolean;
    hideChatButton?: boolean;
    hideConfirmationPane?: boolean;
    hideFooter?: boolean;
    hideHeader?: boolean;
    hideLoadingPane?: boolean;
    hideOutOfOfficeHoursPane?: boolean;
    hidePostChatLoadingPane?: boolean;
    hidePreChatSurveyPane?: boolean;
    hideProactiveChatPane?: boolean;
    hideReconnectChatPane?: boolean;
    hideWebChatContainer?: boolean;
    skipChatButtonRendering?: boolean;
    widgetInstanceId?: string | undefined;
}