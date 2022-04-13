import { IInputValidationPaneClassNames } from "./IInputValidationPaneClassNames";
import { IStyle } from "@fluentui/react";

export interface IInputValidationPaneStyleProps {
    generalStyleProps?: IStyle;
    headerGroupStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    inputStyleProps?: IStyle;
    invalidInputErrorMessageStyleProps?: IStyle;
    buttonGroupStyleProps?: IStyle;
    sendButtonStyleProps?: IStyle;
    sendButtonHoveredStyleProps?: IStyle;
    cancelButtonStyleProps?: IStyle;
    cancelButtonHoveredStyleProps?: IStyle;
    classNames?: IInputValidationPaneClassNames;
}