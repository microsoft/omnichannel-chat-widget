import { ILoadingPaneControlProps } from "../../interfaces/ILoadingPaneControlProps";
import { defaultLoadingPaneControlProps } from "../defaultProps/defaultLoadingPaneControlProps";

export const presetOneLoadingPaneControlProps: ILoadingPaneControlProps = {
    ...defaultLoadingPaneControlProps,
    id: "oc-lcw-loadingpane-preset1",
    dir: "rtl"
};