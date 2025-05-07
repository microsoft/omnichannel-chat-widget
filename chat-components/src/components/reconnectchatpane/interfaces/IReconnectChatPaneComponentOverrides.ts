import { ReactNode } from "react";

export interface IReconnectChatPaneComponentOverrides {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    icon?: ReactNode | string;
    continueChatButton?: ReactNode | string;
    startNewChatButton?: ReactNode | string;
}