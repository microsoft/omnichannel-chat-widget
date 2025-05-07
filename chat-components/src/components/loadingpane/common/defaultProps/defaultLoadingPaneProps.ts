import { ILoadingPaneProps } from "../../interfaces/ILoadingPaneProps";
import { defaultLoadingPaneStyles } from "./defaultStyles/defaultLoadingPaneStyles";
import { defaultLoadingPaneControlProps } from "./defaultLoadingPaneControlProps";

export const defaultLoadingPaneProps: ILoadingPaneProps = {
    controlProps: defaultLoadingPaneControlProps,
    styleProps: defaultLoadingPaneStyles
};