import { IInputValidationPaneStyleProps } from "../../../interfaces/IInputValidationPaneStyleProps";
import { defaultInputValidationPaneSubtitleStyles } from "./defaultInputValidationPaneSubtitleStyles";
import { defaultInputValidationPaneButtonGroupStyles } from "./defaultInputValidationPaneButtonGroupStyles";
import { defaultInputValidationPaneGeneralStyles } from "./defaultInputValidationPaneGeneralStyles";
import { defaultInputValidationPaneTitleStyles } from "./defaultInputValidationPaneTitleStyles";
import { defaultInputValidationPaneInputStyles } from "./defaultInputValidationPaneInputStyles";
import { defaultInputValidationPaneSendButtonStyles } from "./defaultInputValidationPaneSendButtonStyles";
import { defaultInputValidationPaneSendButtonHoveredStyles } from "./defaultInputValidationPaneSendButtonHoveredStyles";
import { defaultInputValidationPaneCancelButtonStyles } from "./defaultInputValidationPaneCancelButtonStyles";
import { defaultInputValidationPaneCancelButtonHoveredStyles } from "./defaultInputValidationPaneCancelButtonHoveredStyles";
import { defaultInputValidationPaneHeaderGroupStyles } from "./defaultInputValidationPaneHeaderGroupStyles";
import { defaultInputValidationPaneInvalidInputErrorMessageStyles } from "./defaultInputValidationPaneInvalidInputErrorMessageStyles";

export const defaultInputValidationPaneStyles: IInputValidationPaneStyleProps = {
    generalStyleProps: defaultInputValidationPaneGeneralStyles,
    headerGroupStyleProps: defaultInputValidationPaneHeaderGroupStyles,
    titleStyleProps: defaultInputValidationPaneTitleStyles,
    subtitleStyleProps: defaultInputValidationPaneSubtitleStyles,
    inputStyleProps: defaultInputValidationPaneInputStyles,
    invalidInputErrorMessageStyleProps: defaultInputValidationPaneInvalidInputErrorMessageStyles,
    buttonGroupStyleProps: defaultInputValidationPaneButtonGroupStyles,
    sendButtonStyleProps: defaultInputValidationPaneSendButtonStyles,
    sendButtonHoveredStyleProps: defaultInputValidationPaneSendButtonHoveredStyles,
    cancelButtonStyleProps: defaultInputValidationPaneCancelButtonStyles,
    cancelButtonHoveredStyleProps: defaultInputValidationPaneCancelButtonHoveredStyles
};