import { IReconnectChatPaneClassNames } from "./IReconnectChatPaneClassNames";
import { IStyle } from "@fluentui/react";

export interface IReconnectChatPaneStyleProps {
    generalStyleProps?: IStyle;
    wrapperStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    iconStyleProps?: IStyle;
    buttonGroupStyleProps?: IStyle;
    continueChatButtonStyleProps?: IStyle;
    continueChatButtonHoveredStyleProps?: IStyle;
    continueChatButtonFocusedStyleProps?: IStyle;
    startNewChatButtonStyleProps?: IStyle;
    startNewChatButtonHoveredStyleProps?: IStyle;
    startNewChatButtonFocusedStyleProps?: IStyle;
    classNames?: IReconnectChatPaneClassNames;
}