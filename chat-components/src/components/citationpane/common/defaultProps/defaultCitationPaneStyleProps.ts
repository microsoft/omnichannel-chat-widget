import { ICitationPaneStyleProps } from "../../interfaces/ICitationPaneStyleProps";
import { defaultCitationPaneCloseButtonFocusedStyles } from "../defaultStyles/defaultCitationPaneCloseButtonFocusedStyles";
import { defaultCitationPaneCloseButtonHoveredStyles } from "../defaultStyles/defaultCitationPaneCloseButtonHoveredStyles";
import { defaultCitationPaneCloseButtonStyles } from "../defaultStyles/defaultCitationPaneCloseButtonStyles";
import { defaultCitationPaneContentStyles } from "../defaultStyles/defaultCitationPaneContentStyles";
import { defaultCitationPaneGeneralStyles } from "../defaultStyles/defaultCitationPaneGeneralStyles";
import { defaultCitationPaneTitleStyles } from "../defaultStyles/defaultCitationPaneTitleStyles";
import { defaultCitationPaneTopCloseButtonFocusedStyles } from "../defaultStyles/defaultCitationPaneTopCloseButtonFocusedStyles";
import { defaultCitationPaneTopCloseButtonHoveredStyles } from "../defaultStyles/defaultCitationPaneTopCloseButtonHoveredStyles";
import { defaultCitationPaneTopCloseButtonStyles } from "../defaultStyles/defaultCitationPaneTopCloseButtonStyles";

export const defaultCitationPaneStyleProps: ICitationPaneStyleProps = {
    generalStyleProps: defaultCitationPaneGeneralStyles,
    titleStyleProps: defaultCitationPaneTitleStyles,
    contentStyleProps: defaultCitationPaneContentStyles,
    closeButtonStyleProps: defaultCitationPaneCloseButtonStyles,
    closeButtonHoveredStyleProps: defaultCitationPaneCloseButtonHoveredStyles,
    closeButtonFocusedStyleProps: defaultCitationPaneCloseButtonFocusedStyles,
    topCloseButtonStyleProps: defaultCitationPaneTopCloseButtonStyles,
    topCloseButtonHoveredStyleProps: defaultCitationPaneTopCloseButtonHoveredStyles,
    topCloseButtonFocusedStyleProps: defaultCitationPaneTopCloseButtonFocusedStyles
};