export interface IReconnectChatPaneControlProps {
    id?: string;
    dir?: "ltr" | "rtl" | "auto";
    hideReconnectChatPane?: boolean;
    reconnectChatPaneAriaLabel?: string;

    hideTitle?: boolean;
    titleText?: string;

    hideSubtitle?: boolean;
    subtitleText?: string;

    hideIcon?: boolean;
    iconAriaLabel?: string;

    isButtonGroupHorizontal?: boolean;
    
    hideContinueChatButton?: boolean;
    continueChatButtonText?: string;
    continueChatButtonAriaLabel?: string;

    hideStartNewChatButton?: boolean;
    startNewChatButtonText?: string;
    startNewChatButtonAriaLabel?: string;

    onContinueChat?: () => void;
    onStartNewChat?: () => void;
    onMinimize?: () => void;
}