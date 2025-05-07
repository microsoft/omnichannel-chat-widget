import { ReactNode } from "react";

export interface ILiveChatWidgetComponentOverrides {
    chatButton?: ReactNode | string;
    confirmationPane?: ReactNode | string;
    footer?: ReactNode | string;
    emailTranscriptPane?: ReactNode | string;
    header?: ReactNode | string;
    loadingPane?: ReactNode | string;
    startChatErrorPane?: ReactNode | string;
    outOfOfficeHoursPane?: ReactNode | string;
    postChatLoadingPane?: ReactNode | string;
    postChatSurveyPane?: ReactNode | string;
    preChatSurveyPane?: ReactNode | string;
    proactiveChatPane?: ReactNode | string;
    reconnectChatPane?: ReactNode | string;
    webChatContainer?: ReactNode | string;
}
