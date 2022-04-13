import { ReactNode } from "react";

export interface IChatButtonComponentOverrides {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    notificationBubble?: ReactNode | string;
    iconContainer?: ReactNode | string;
    textContainer?: ReactNode | string;
}
