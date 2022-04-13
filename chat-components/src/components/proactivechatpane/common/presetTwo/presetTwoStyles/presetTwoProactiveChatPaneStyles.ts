import { IProactiveChatPaneStyleProps } from "../../../interfaces/IProactiveChatPaneStyleProps";
import { presetTwoProactiveChatPaneBodyContainerStyles } from "./presetTwoProactiveChatPaneBodyContainerStyles";
import { presetTwoProactiveChatPaneGeneralStyles } from "./presetTwoProactiveChatPaneGeneralStyles";
import { presetTwoProactiveChatPaneHeaderContainerStyles } from "./presetTwoProactiveChatPaneHeaderContainerStyles";
import { presetTwoProactiveChatPaneTextContainerStyles } from "./presetTwoProactiveChatPaneTextContainerStyles";
import { presetTwoProactiveChatPaneStartButtonStyles } from "./presetTwoProactiveChatPaneStartButtonStyles";
import { presetTwoProactiveChatPaneStartButtonHoveredStyles } from "./presetTwoProactiveChatPaneStartButtonHoveredStyles";

export const presetTwoProactiveChatPaneStyles: IProactiveChatPaneStyleProps = {
    generalStyleProps: presetTwoProactiveChatPaneGeneralStyles,
    headerContainerStyleProps: presetTwoProactiveChatPaneHeaderContainerStyles,
    textContainerStyleProps: presetTwoProactiveChatPaneTextContainerStyles,
    bodyContainerStyleProps: presetTwoProactiveChatPaneBodyContainerStyles,
    startButtonStyleProps: presetTwoProactiveChatPaneStartButtonStyles,
    startButtonHoveredStyleProps: presetTwoProactiveChatPaneStartButtonHoveredStyles
};