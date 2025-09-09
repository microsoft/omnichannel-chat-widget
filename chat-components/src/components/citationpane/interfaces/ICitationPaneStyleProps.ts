import { ICitationPaneClassNames } from "./ICitationPaneClassNames";
import { IStyle } from "@fluentui/react";

export interface ICitationPaneStyleProps {
    generalStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    contentStyleProps?: IStyle;
    closeButtonStyleProps?: IStyle;
    topCloseButtonStyleProps?: IStyle;
    classNames?: ICitationPaneClassNames;
}