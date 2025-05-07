import { ILoadingPaneControlProps } from "./ILoadingPaneControlProps";
import { ILoadingPaneComponentOverrides } from "./ILoadingPaneComponentOverrides";
import { ILoadingPaneStyleProps } from "./ILoadingPaneStyleProps";

export interface ILoadingPaneProps {
    componentOverrides?: ILoadingPaneComponentOverrides;
    controlProps?: ILoadingPaneControlProps;
    styleProps?: ILoadingPaneStyleProps;
    windowWidth?: number;
    windowHeight?: number;
}