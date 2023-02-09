import { ILoadingPaneProps } from "../../interfaces/ILoadingPaneProps";
import { presetOneLoadingPaneControlProps } from "./presetOneLoadingPaneControlProps";
import { defaultLoadingPaneStyles } from "../defaultProps/defaultStyles/defaultLoadingPaneStyles";

export const presetOneLoadingPaneProps: ILoadingPaneProps = {
    controlProps: presetOneLoadingPaneControlProps,
    styleProps: defaultLoadingPaneStyles
};