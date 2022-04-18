import { IInputValidationPaneProps } from "../../../interfaces/IInputValidationPaneProps";
import { presetTwoInputValidationPaneStyles } from "../presetTwoStyles/presetTwoInputValidationPaneStyles";
import { presetTwoInputValidationPaneComponentOverrides } from "./presetTwoInputValidationPaneComponentOverrides";
import { presetTwoInputValidationPaneControlProps } from "./presetTwoInputValidationPaneControlProps";

export const presetTwoInputValidationPaneProps: IInputValidationPaneProps = {
    controlProps: presetTwoInputValidationPaneControlProps,
    styleProps: presetTwoInputValidationPaneStyles,
    componentOverrides: presetTwoInputValidationPaneComponentOverrides
};