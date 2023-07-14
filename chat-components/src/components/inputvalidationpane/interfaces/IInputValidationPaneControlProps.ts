export interface IInputValidationPaneControlProps {
    id?: string;
    dir?: "ltr" | "rtl" | "auto";
    hideInputValidationPane?: boolean;
    inputValidationPaneAriaLabel?: string;

    hideTitle?: boolean;
    titleText?: string;

    hideSubtitle?: boolean;
    subtitleText?: string;

    inputId?: string;
    inputInitialText?: string;
    hideInput?: boolean;
    inputAriaLabel?: string;
    inputWithErrorMessageBorderColor?: string;
    inputPlaceHolder?: string;

    invalidInputErrorMessageText?: string;

    isButtonGroupHorizontal?: boolean;

    hideSendButton?: boolean;
    enableSendButton?: boolean;
    sendButtonText?: string;
    sendButtonAriaLabel?: string;

    hideCancelButton?: boolean;
    cancelButtonText?: string;
    cancelButtonAriaLabel?: string;

    brightnessValueOnDim?: string;

    onSend?: (input: string) => void;
    onCancel?: () => void;
    checkInput?: (input: string) => boolean;
}