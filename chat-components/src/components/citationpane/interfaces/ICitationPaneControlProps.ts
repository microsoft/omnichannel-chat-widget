export interface ICitationPaneControlProps {
    id?: string;
    dir?: "ltr" | "rtl" | "auto";
    hideCitationPane?: boolean;
    hideTitle?: boolean;
    titleText?: string;
    contentHtml?: string;
    hideCloseButton?: boolean;
    closeButtonText?: string;
    closeButtonAriaLabel?: string;
    hideTopCloseButton?: boolean;
    topCloseButtonAriaLabel?: string;
    topCloseButtonPosition?: "topLeft" | "topRight";
    brightnessValueOnDim?: string;
    onClose?: () => void;
}