import { ICitationPaneControlProps } from "../../interfaces/ICitationPaneControlProps";

export const defaultCitationPaneControlProps: ICitationPaneControlProps = {
    id: "ocw-citation-pane",
    dir: "ltr",
    hideTitle: false,
    titleText: "Citation",
    hideCloseButton: false,
    closeButtonText: "Close",
    closeButtonAriaLabel: "Close citation",
    onClose: () => { 
        console.log("Citation pane close");
    }
};
