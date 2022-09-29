export interface IChatButtonControlProps {
    id?: string;
    dir?: "auto" | "ltr" | "rtl";
    role?: string;
    ariaLabel?: string;
    titleText?: string;
    subtitleText?: string;
    unreadMessageCount?: string;
    onClick?: () => void;
    hideChatButton?: boolean;
    hideChatIcon?: boolean;
    hideChatTextContainer?: boolean;
    hideChatSubtitle?: boolean;
    hideChatTitle?: boolean;
    hideNotificationBubble?: boolean;
    unreadMessageString?: string;
    largeUnreadMessageString?: string;
    ariaLabelUnreadMessageString?: string;
}
