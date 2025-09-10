import { HtmlAttributeNames } from "../../../../../../chat-widget/src/common/Constants";
import { ICitationPaneControlProps } from "../../interfaces/ICitationPaneControlProps";

export const defaultCitationPaneControlProps: ICitationPaneControlProps = {
    id: HtmlAttributeNames.ocwCitationPaneClassName,
    dir: "ltr",
    hideTitle: false,
    titleText: HtmlAttributeNames.ocwCitationPaneTitle,
    hideCloseButton: false,
    closeButtonText: "Close",
    closeButtonAriaLabel: "Close citation",
    hideTopCloseButton: false,
    topCloseButtonAriaLabel: "Close",
    topCloseButtonPosition: "topRight",
    onClose: () => { 
        console.log("Citation pane close");
    }
};