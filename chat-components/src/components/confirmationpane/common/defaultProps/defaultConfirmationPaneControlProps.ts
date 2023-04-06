import { AriaLabels, Ids, Texts } from "../../../../common/Constants";
import { IConfirmationPaneControlProps } from "../../interfaces/IConfirmationPaneControlProps";

export const defaultConfirmationPaneControlProps: IConfirmationPaneControlProps = {
    id: Ids.DefaultConfirmationPaneId,
    dir: "ltr",
    hideConfirmationPane: false,
    hideTitle: false,
    titleText: Texts.ConfirmationPaneTitle,
    hideSubtitle: false,
    subtitleText: Texts.ConfirmationPaneSubtitle,
    hideConfirmButton: false,
    confirmButtonText: Texts.ConfirmButtonText,
    confirmButtonAriaLabel: AriaLabels.ConfirmationPaneConfirm,
    hideCancelButton: false,
    cancelButtonText: Texts.CancelButtonText,
    cancelButtonAriaLabel: AriaLabels.ConfirmationPaneCancel,
    onConfirm: function () {
        console.log("on confirm");
    },
    onCancel: function () {
        console.log("on cancel");
    }
};
