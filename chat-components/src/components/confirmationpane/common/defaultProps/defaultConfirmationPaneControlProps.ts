import { IConfirmationPaneControlProps } from "../../interfaces/IConfirmationPaneControlProps";

export const defaultConfirmationPaneControlProps: IConfirmationPaneControlProps = {
    id: "lcw-components-confirmation-pane",
    dir: "ltr",
    hideConfirmationPane: false,
    hideTitle: false,
    titleText: "Close chat",
    hideSubtitle: false,
    subtitleText: "Do you really want to close this chat?",
    hideConfirmButton: false,
    confirmButtonText: "Close",
    confirmButtonAriaLabel: "Close Chat",
    hideCancelButton: false,
    cancelButtonText: "Cancel",
    cancelButtonAriaLabel: "Cancel. Return to Chat",
    onConfirm: function () {
        console.log("on confirm");
    },
    onCancel: function () {
        console.log("on cancel");
    }
};
