export interface IConfirmationPaneControlProps {
    id?: string;
    dir?: "ltr" | "rtl" | "auto";
    hideConfirmationPane?: boolean;
    hideTitle?: boolean;
    titleText?: string;
    hideSubtitle?: boolean;
    subtitleText?: string;
    buttonGroupAriaLabel?: string;
    hideConfirmButton?: boolean;
    confirmButtonText?: string;
    confirmButtonAriaLabel?: string;
    hideCancelButton?: boolean;
    cancelButtonText?: string;
    cancelButtonAriaLabel?: string;
    brightnessValueOnDim?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}