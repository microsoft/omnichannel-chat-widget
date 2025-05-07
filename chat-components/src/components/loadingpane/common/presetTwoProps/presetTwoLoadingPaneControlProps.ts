import { SpinnerSize } from "@fluentui/react";
import { ILoadingPaneControlProps } from "../../interfaces/ILoadingPaneControlProps";
import { defaultLoadingPaneControlProps } from "../defaultProps/defaultLoadingPaneControlProps";

export const presetTwoLoadingPaneControlProps: ILoadingPaneControlProps = {
    ...defaultLoadingPaneControlProps,
    id: "lcw-loading-pane-preset2",
    hideIcon: true,
    hideTitle: true,
    hideSubtitle: true,
    hideSpinnerText: true,
    spinnerSize: SpinnerSize.large
};