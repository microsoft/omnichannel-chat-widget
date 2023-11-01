import { IInputValidationPaneControlProps } from "../../../interfaces/IInputValidationPaneControlProps";
import { AriaLabels, Ids, Regex, Texts } from "../../../../../common/Constants";

export const defaultInputValidationPaneControlProps: IInputValidationPaneControlProps = {
    id: Ids.DefaultInputValidationPaneId,
    dir: "ltr",
    hideInputValidationPane: false,
    inputValidationPaneAriaLabel: AriaLabels.EmailChatTranscriptPane,

    hideTitle: false,
    titleText: Texts.InputValidationPaneTitleText,

    hideSubtitle: false,
    subtitleText: Texts.InputValidationPaneSubtitleText,

    inputId: Ids.DefaultInputValidationPaneInputId,
    inputInitialText: "",
    inputPlaceHolder: Texts.EmailPlaceHolderText,
    hideInput: false,
    inputAriaLabel: AriaLabels.InputValidationPaneInput,
    inputWithErrorMessageBorderColor: "rgb(164, 38, 44)",

    invalidInputErrorMessageText: Texts.InvalidInputErrorMessageText,

    isButtonGroupHorizontal: true,

    hideSendButton: false,
    enableSendButton: false,
    sendButtonText: Texts.SaveButtonText,
    sendButtonAriaLabel: AriaLabels.Save,

    hideCancelButton: false,
    cancelButtonText: Texts.CancelButtonText,
    cancelButtonAriaLabel: AriaLabels.Cancel,

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