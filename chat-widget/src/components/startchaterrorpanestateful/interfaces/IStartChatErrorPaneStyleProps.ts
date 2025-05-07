import { IImageProps, IStyle } from "@fluentui/react";
import { IStartChatErrorPaneClassNames } from "./IStartChatErrorPaneClassNames";

export interface IStartChatErrorPaneStyleProps {
    generalStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    iconStyleProps?: IStyle;
    iconImageProps?: IImageProps;
    classNames?: IStartChatErrorPaneClassNames;
}