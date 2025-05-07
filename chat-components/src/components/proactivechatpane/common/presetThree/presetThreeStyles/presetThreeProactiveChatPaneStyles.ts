import { IProactiveChatPaneStyleProps } from "../../../interfaces/IProactiveChatPaneStyleProps";
import { presetThreeProactiveChatPaneBodyContainerStyles } from "./presetThreeProactiveChatPaneBodyContainerStyles";
import { presetThreeProactiveChatPaneGeneralStyles } from "./presetThreeProactiveChatPaneGeneralStyles";
import { presetThreeProactiveChatPaneCloseButtonStyles } from "./presetThreeProactiveChatPaneCloseButtonStyles";
import { presetThreeProactiveChatPaneHeaderContainerStyles } from "./presetThreeProactiveChatPaneHeaderContainerStyles";
import { presetThreeProactiveChatPaneStartButtonStyles } from "./presetThreeProactiveChatPaneStartButtonStyles";
import { presetThreeProactiveChatPaneStartButtonHoveredStyles } from "./presetThreeProactiveChatPaneStartButtonHoveredStyles";
import { presetThreeProactiveChatPaneCloseButtonHoveredStyles } from "./presetThreeProactiveChatPaneCloseButtonHoveredStyles";

export const presetThreeProactiveChatPaneStyles: IProactiveChatPaneStyleProps = {
    generalStyleProps: presetThreeProactiveChatPaneGeneralStyles,
    headerContainerStyleProps: presetThreeProactiveChatPaneHeaderContainerStyles,
    closeButtonStyleProps: presetThreeProactiveChatPaneCloseButtonStyles,
    closeButtonHoveredStyleProps: presetThreeProactiveChatPaneCloseButtonHoveredStyles,
    bodyContainerStyleProps: presetThreeProactiveChatPaneBodyContainerStyles,
    startButtonStyleProps: presetThreeProactiveChatPaneStartButtonStyles,
    startButtonHoveredStyleProps: presetThreeProactiveChatPaneStartButtonHoveredStyles
};