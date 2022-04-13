import { IInputValidationPaneControlProps } from "../../../interfaces/IInputValidationPaneControlProps";
import { Regex } from "../../../../../common/Constants";

export const defaultInputValidationPaneControlProps: IInputValidationPaneControlProps = {
    id: "oclcw-emailTranscriptDialogContainer",
    dir: "ltr",
    hideInputValidationPane: false,
    inputValidationPaneAriaLabel: "Email Chat Transcript Pane",

    hideTitle: false,
    titleText: "Email this chat transcript",

    hideSubtitle: false,
    subtitleText: "This will be sent after your chat ends.",

    inputId: "oclcw-emailTranscriptDialogTextField",
    inputInitialText: "",
    hideInput: false,
    inputAriaLabel: "Email this chat transcript. This will be sent after your chat ends. Email address text area",
    inputWithErrorMessageBorderColor: "rgb(164, 38, 44)",

    invalidInputErrorMessageText: "Enter a valid email address.",

    isButtonGroupHorizontal: true,

    hideSendButton: false,
    enableSendButton: false,
    sendButtonText: "Send",
    sendButtonAriaLabel: "Send",

    hideCancelButton: false,
    cancelButtonText: "Cancel",
    cancelButtonAriaLabel: "Cancel",

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSend: function (input: string) {
        console.log("on send");
    },

    onCancel: function () {
        console.log("on cancel");
    },

    checkInput: function (input: string) {
        return (new RegExp(Regex.EmailRegex)).test(input);
    },
};