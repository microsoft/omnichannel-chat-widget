import { ICitationPaneClassNames } from "./ICitationPaneClassNames";
import { IStyle } from "@fluentui/react";

export interface ICitationPaneStyleProps {
    generalStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    contentStyleProps?: IStyle;
    closeButtonStyleProps?: IStyle;
    closeButtonHoveredStyleProps?: IStyle;
    closeButtonFocusedStyleProps?: IStyle;
    topCloseButtonStyleProps?: IStyle;
    topCloseButtonHoveredStyleProps?: IStyle;
    topCloseButtonFocusedStyleProps?: IStyle;
    classNames?: ICitationPaneClassNames;
}