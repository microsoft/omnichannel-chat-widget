import { IProactiveChatPaneStyleProps } from "../../../interfaces/IProactiveChatPaneStyleProps";
import { presetOneProactiveChatPaneBodyTitleStyles } from "./presetOneProactiveChatPaneBodyTitleStyles";
import { presetOneProactiveChatPaneCloseButtonStyles } from "./presetOneProactiveChatPaneCloseButtonStyles";
import { presetOneProactiveChatPaneStartButtonStyles } from "./presetOneProactiveChatPaneStartButtonStyles";
import { presetOneProactiveChatPaneStartButtonHoveredStyles } from "./presetOneProactiveChatPaneStartButtonHoveredStyles";
import { presetOneProactiveChatPaneCloseButtonHoveredStyles } from "./presetOneProactiveChatPaneCloseButtonHoveredStyles";

export const presetOneProactiveChatPaneStyles: IProactiveChatPaneStyleProps = {
    closeButtonStyleProps: presetOneProactiveChatPaneCloseButtonStyles,
    closeButtonHoveredStyleProps: presetOneProactiveChatPaneCloseButtonHoveredStyles,
    bodyTitleStyleProps: presetOneProactiveChatPaneBodyTitleStyles,
    startButtonStyleProps: presetOneProactiveChatPaneStartButtonStyles,
    startButtonHoveredStyleProps: presetOneProactiveChatPaneStartButtonHoveredStyles
};