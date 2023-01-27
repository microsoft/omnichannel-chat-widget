import { IOOOHPaneControlProps } from "../../interfaces/IOOOHPaneControlProps";
import { defaultOOOHPaneControlProps } from "../defaultProps/defaultOOOHPaneControlProps";

export const presetFourOOOHPaneControlProps: IOOOHPaneControlProps = {
    ...defaultOOOHPaneControlProps,
    id: "oc-lcw-outofofficehourspane-preset1",
    titleText: "We are out of office. Please contact us here https://www.microsoft.com for further assisstance",
    openLinkInNewTab: true
};