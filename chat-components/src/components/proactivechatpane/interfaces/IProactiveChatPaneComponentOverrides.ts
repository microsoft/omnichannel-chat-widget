import { ReactNode } from "react";

export interface IProactiveChatPaneComponentOverrides {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    closeButton?: ReactNode | string;
    bodyTitle?: ReactNode | string;
    startButton?: ReactNode | string;
}