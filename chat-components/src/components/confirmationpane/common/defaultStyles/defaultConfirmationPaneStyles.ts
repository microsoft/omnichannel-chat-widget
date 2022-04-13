import { IConfirmationPaneStyleProps } from "../../interfaces/IConfirmationPaneStyleProps";
import { defaultConfirmationPaneButtonGroupStyles } from "./defaultConfirmationPaneButtonGroupStyles";
import { defaultConfirmationPaneCancelButtonStyles } from "./defaultConfirmationPaneCancelButtonStyles";
import { defaultConfirmationPaneConfirmButtonStyles } from "./defaultConfirmationPaneConfirmButtonStyles";
import { defaultConfirmationPaneGeneralStyles } from "./defaultConfirmationPaneGeneralStyles";
import { defaultConfirmationPaneSubtitleStyles } from "./defaultConfirmationPaneSubtitleStyles";
import { defaultConfirmationPaneTitleStyles } from "./defaultConfirmationPaneTitleStyles";

export const defaultConfirmationPaneStyles: IConfirmationPaneStyleProps = {
    generalStyleProps: defaultConfirmationPaneGeneralStyles,
    titleStyleProps: defaultConfirmationPaneTitleStyles,
    subtitleStyleProps: defaultConfirmationPaneSubtitleStyles,
    buttonGroupStyleProps: defaultConfirmationPaneButtonGroupStyles,
    confirmButtonStyleProps: defaultConfirmationPaneConfirmButtonStyles,
    cancelButtonStyleProps: defaultConfirmationPaneCancelButtonStyles
};
