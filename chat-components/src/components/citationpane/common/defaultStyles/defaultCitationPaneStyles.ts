import { ICitationPaneStyleProps } from "../../interfaces/ICitationPaneStyleProps";
import { defaultCitationPaneCloseButtonFocusedStyles } from "./defaultCitationPaneCloseButtonFocusedStyles";
import { defaultCitationPaneCloseButtonHoveredStyles } from "./defaultCitationPaneCloseButtonHoveredStyles";
import { defaultCitationPaneCloseButtonStyles } from "./defaultCitationPaneCloseButtonStyles";
import { defaultCitationPaneContentStyles } from "./defaultCitationPaneContentStyles";
import { defaultCitationPaneGeneralStyles } from "./defaultCitationPaneGeneralStyles";
import { defaultCitationPaneTitleStyles } from "./defaultCitationPaneTitleStyles";
import { defaultCitationPaneTopCloseButtonFocusedStyles } from "./defaultCitationPaneTopCloseButtonFocusedStyles";
import { defaultCitationPaneTopCloseButtonHoveredStyles } from "./defaultCitationPaneTopCloseButtonHoveredStyles";
import { defaultCitationPaneTopCloseButtonStyles } from "./defaultCitationPaneTopCloseButtonStyles";

export const defaultCitationPaneStyles: ICitationPaneStyleProps = {
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