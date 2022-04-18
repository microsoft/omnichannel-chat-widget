export interface IProactiveChatPaneControlProps {
    id?: string;
    dir?: "ltr" | "rtl" | "auto";
    hideProactiveChatPane?: boolean;
    proactiveChatPaneAriaLabel?: string;

    hideTitle?: boolean;
    titleText?: string;

    hideSubtitle?: boolean;
    subtitleText?: string;

    hideCloseButton?: boolean;
    closeButtonAriaLabel?: string;

    isBodyContainerHorizantal?: boolean;
    
    hideBodyTitle?: boolean;
    bodyTitleText?: string;

    hideStartButton?: boolean;
    startButtonText?: string;
    startButtonAriaLabel?: string;

    onClose?: () => void;
    onStart?: () => void;
}