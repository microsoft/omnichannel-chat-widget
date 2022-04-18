import { IProactiveChatPaneClassNames } from "./IProactiveChatPaneClassNames";
import { IStyle } from "@fluentui/react";

export interface IProactiveChatPaneStyleProps {
    generalStyleProps?: IStyle;
    headerContainerStyleProps?: IStyle;
    textContainerStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    closeButtonStyleProps?: IStyle;
    closeButtonHoveredStyleProps?: IStyle;
    bodyContainerStyleProps?: IStyle;
    bodyTitleStyleProps?: IStyle;
    startButtonStyleProps?: IStyle;
    startButtonHoveredStyleProps?: IStyle;
    classNames?: IProactiveChatPaneClassNames;
}