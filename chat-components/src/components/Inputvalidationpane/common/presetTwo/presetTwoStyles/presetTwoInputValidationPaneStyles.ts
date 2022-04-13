import { IInputValidationPaneStyleProps } from "../../../interfaces/IInputValidationPaneStyleProps";
import { presetTwoInputValidationPaneTitleStyles } from "./presetTwoInputValidationPaneTitleStyles";
import { presetTwoInputValidationPaneInputStyles } from "./presetTwoInputValidationPaneInputStyles";
import { presetTwoInputValidationPaneSendButtonStyles } from "./presetTwoInputValidationPaneSendButtonStyles";
import { presetTwoInputValidationPaneCancelButtonStyles } from "./presetTwoInputValidationPaneCancelButtonStyles";
import { presetTwoInputValidationPaneHeaderGroupStyles } from "./presetTwoInputValidationPaneHeaderGroupStyles";

export const presetTwoInputValidationPaneStyles: IInputValidationPaneStyleProps = {
    headerGroupStyleProps: presetTwoInputValidationPaneHeaderGroupStyles,
    titleStyleProps: presetTwoInputValidationPaneTitleStyles,
    inputStyleProps: presetTwoInputValidationPaneInputStyles,
    sendButtonStyleProps: presetTwoInputValidationPaneSendButtonStyles,
    cancelButtonStyleProps: presetTwoInputValidationPaneCancelButtonStyles
};