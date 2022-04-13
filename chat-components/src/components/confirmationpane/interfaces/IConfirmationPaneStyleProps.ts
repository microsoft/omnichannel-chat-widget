import { IConfirmationPaneClassNames } from "./IConfirmationPaneClassNames";
import { IStyle } from "@fluentui/react";

export interface IConfirmationPaneStyleProps {
    generalStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    buttonGroupStyleProps?: IStyle;
    confirmButtonStyleProps?: IStyle;
    confirmButtonHoveredStyleProps?: IStyle;
    confirmButtonFocusedStyleProps?: IStyle;
    cancelButtonStyleProps?: IStyle;
    cancelButtonHoveredStyleProps?: IStyle;
    cancelButtonFocusedStyleProps?: IStyle;
    classNames?: IConfirmationPaneClassNames;
}