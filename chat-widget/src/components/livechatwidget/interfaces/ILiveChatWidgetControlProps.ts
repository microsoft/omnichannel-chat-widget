export interface ILiveChatWidgetControlProps {
    id?: string;
    dir?: "rtl" | "ltr";
    hideCallingContainer?: boolean;
    hideChatButton?: boolean;
    hideConfirmationPane?: boolean;
    hideErrorUIPane?: boolean;
    hideFooter?: boolean;
    hideHeader?: boolean;
    hideLoadingPane?: boolean;
    hideOutOfOfficeHoursPane?: boolean;
    hidePostChatLoadingPane?: boolean;
    hidePreChatSurveyPane?: boolean;
    hideProactiveChatPane?: boolean;
    hideReconnectChatPane?: boolean;
    hideWebChatContainer?: boolean;
    hideStartChatButton?: boolean;
    widgetInstanceId?: string | undefined;
    cacheTtlInMins?: number;
    skipBroadcastChannelInit?: boolean;
}