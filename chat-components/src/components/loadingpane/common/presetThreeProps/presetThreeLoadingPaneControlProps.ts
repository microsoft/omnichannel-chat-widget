import { SpinnerSize } from "@fluentui/react";
import { ILoadingPaneControlProps } from "../../interfaces/ILoadingPaneControlProps";
import { defaultLoadingPaneControlProps } from "../defaultProps/defaultLoadingPaneControlProps";

export const presetThreeLoadingPaneControlProps: ILoadingPaneControlProps = {
    ...defaultLoadingPaneControlProps,
    id: "lcw-loading-pane-preset3",
    titleText: "Please Wait ...",
    subtitleText: "Loading Content",
    spinnerText: "Processing ...",
    spinnerSize: SpinnerSize.large
};