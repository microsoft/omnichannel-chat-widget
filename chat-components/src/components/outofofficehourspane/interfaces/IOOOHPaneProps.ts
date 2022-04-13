import { IOOOHPaneControlProps } from "./IOOOHPaneControlProps";
import { IOOOHPaneComponentOverrides } from "./IOOOHPaneComponentOverrides";
import { IOOOHPaneStyleProps } from "./IOOOHPaneStyleProps";

export interface IOOOHPaneProps {
    componentOverrides?: IOOOHPaneComponentOverrides;
    controlProps?: IOOOHPaneControlProps;
    styleProps?: IOOOHPaneStyleProps;
}