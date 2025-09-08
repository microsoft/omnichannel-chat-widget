import { ICitationPaneStyleProps } from "../../interfaces/ICitationPaneStyleProps";
import { defaultCitationPaneCloseButtonStyles } from "../defaultStyles/defaultCitationPaneCloseButtonStyles";
import { defaultCitationPaneContentStyles } from "../defaultStyles/defaultCitationPaneContentStyles";
import { defaultCitationPaneGeneralStyles } from "../defaultStyles/defaultCitationPaneGeneralStyles";
import { defaultCitationPaneTitleStyles } from "../defaultStyles/defaultCitationPaneTitleStyles";
import { defaultCitationPaneTopCloseButtonStyles } from "../defaultStyles/defaultCitationPaneTopCloseButtonStyles";

export const defaultCitationPaneStyleProps: ICitationPaneStyleProps = {
    generalStyleProps: defaultCitationPaneGeneralStyles,
    titleStyleProps: defaultCitationPaneTitleStyles,
    contentStyleProps: defaultCitationPaneContentStyles,
    closeButtonStyleProps: defaultCitationPaneCloseButtonStyles,
    topCloseButtonStyleProps: defaultCitationPaneTopCloseButtonStyles
};