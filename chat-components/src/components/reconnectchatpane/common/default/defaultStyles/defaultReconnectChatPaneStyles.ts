import { IReconnectChatPaneStyleProps } from "../../../interfaces/IReconnectChatPaneStyleProps";
import { defaultReconnectChatPaneSubtitleStyles } from "./defaultReconnectChatPaneSubtitleStyles";
import { defaultReconnectChatPaneButtonGroupStyles } from "./defaultReconnectChatPaneButtonGroupStyles";
import { defaultReconnectChatPaneContinueChatButtonStyles } from "./defaultReconnectChatPaneContinueChatButtonStyles";
import { defaultReconnectChatPaneGeneralStyles } from "./defaultReconnectChatPaneGeneralStyles";
import { defaultReconnectChatPaneTitleStyles } from "./defaultReconnectChatPaneTitleStyles";
import { defaultReconnectChatPaneIconStyles } from "./defaultReconnectChatPaneIconStyles";
import { defaultReconnectChatPaneWrapperStyles } from "./defaultReconnectChatPaneWrapperStyles";
import { defaultReconnectChatPaneStartNewChatButtonStyles } from "./defaultReconnectChatPaneStartNewChatButtonStyles";
import { defaultReconnectChatPaneContinueChatButtonHoveredStyles } from "./defaultReconnectChatPaneContinueChatButtonHoveredStyles";
import { defaultReconnectChatPaneStartNewChatButtonHoveredStyles } from "./defaultReconnectChatPaneStartNewChatButtonHoveredStyles";

export const defaultReconnectChatPaneStyles: IReconnectChatPaneStyleProps = {
    generalStyleProps: defaultReconnectChatPaneGeneralStyles,
    wrapperStyleProps: defaultReconnectChatPaneWrapperStyles,
    titleStyleProps: defaultReconnectChatPaneTitleStyles,
    subtitleStyleProps: defaultReconnectChatPaneSubtitleStyles,
    iconStyleProps: defaultReconnectChatPaneIconStyles,
    buttonGroupStyleProps: defaultReconnectChatPaneButtonGroupStyles,
    continueChatButtonStyleProps: defaultReconnectChatPaneContinueChatButtonStyles,
    continueChatButtonHoveredStyleProps: defaultReconnectChatPaneContinueChatButtonHoveredStyles,
    startNewChatButtonStyleProps: defaultReconnectChatPaneStartNewChatButtonStyles,
    startNewChatButtonHoveredStyleProps: defaultReconnectChatPaneStartNewChatButtonHoveredStyles
};