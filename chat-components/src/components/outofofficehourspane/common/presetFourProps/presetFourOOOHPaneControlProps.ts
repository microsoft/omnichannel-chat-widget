import { IOOOHPaneControlProps } from "../../interfaces/IOOOHPaneControlProps";
import { defaultOOOHPaneControlProps } from "../defaultProps/defaultOOOHPaneControlProps";

export const presetFourOOOHPaneControlProps: IOOOHPaneControlProps = {
    ...defaultOOOHPaneControlProps,
    id: "lcw-out-of-office-hours-pane-preset1",
    titleText: "We are out of office. Please contact us here https://www.microsoft.com for further assisstance",
    openLinkInNewTab: true
};