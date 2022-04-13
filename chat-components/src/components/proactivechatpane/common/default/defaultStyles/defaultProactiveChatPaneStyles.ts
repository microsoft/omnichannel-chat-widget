import { IProactiveChatPaneStyleProps } from "../../../interfaces/IProactiveChatPaneStyleProps";
import { defaultProactiveChatPaneSubtitleStyles } from "./defaultProactiveChatPaneSubtitleStyles";
import { defaultProactiveChatPaneBodyContainerStyles } from "./defaultProactiveChatPaneBodyContainerStyles";
import { defaultProactiveChatPaneBodyTitleStyles } from "./defaultProactiveChatPaneBodyTitleStyles";
import { defaultProactiveChatPaneGeneralStyles } from "./defaultProactiveChatPaneGeneralStyles";
import { defaultProactiveChatPaneTitleStyles } from "./defaultProactiveChatPaneTitleStyles";
import { defaultProactiveChatPaneCloseButtonStyles } from "./defaultProactiveChatPaneCloseButtonStyles";
import { defaultProactiveChatPaneHeaderContainerStyles } from "./defaultProactiveChatPaneHeaderContainerStyles";
import { defaultProactiveChatPaneTextContainerStyles } from "./defaultProactiveChatPaneTextContainerStyles";
import { defaultProactiveChatPaneStartButtonStyles } from "./defaultProactiveChatPaneStartButtonStyles";
import { defaultProactiveChatPaneStartButtonHoveredStyles } from "./defaultProactiveChatPaneStartButtonHoveredStyles";
import { defaultProactiveChatPaneCloseButtonHoveredStyles } from "./defaultProactiveChatPaneCloseButtonHoveredStyles";

export const defaultProactiveChatPaneStyles: IProactiveChatPaneStyleProps = {
    generalStyleProps: defaultProactiveChatPaneGeneralStyles,
    headerContainerStyleProps: defaultProactiveChatPaneHeaderContainerStyles,
    textContainerStyleProps: defaultProactiveChatPaneTextContainerStyles,
    titleStyleProps: defaultProactiveChatPaneTitleStyles,
    subtitleStyleProps: defaultProactiveChatPaneSubtitleStyles,
    closeButtonStyleProps: defaultProactiveChatPaneCloseButtonStyles,
    closeButtonHoveredStyleProps: defaultProactiveChatPaneCloseButtonHoveredStyles,
    bodyContainerStyleProps: defaultProactiveChatPaneBodyContainerStyles,
    bodyTitleStyleProps: defaultProactiveChatPaneBodyTitleStyles,
    startButtonStyleProps: defaultProactiveChatPaneStartButtonStyles,
    startButtonHoveredStyleProps: defaultProactiveChatPaneStartButtonHoveredStyles
};