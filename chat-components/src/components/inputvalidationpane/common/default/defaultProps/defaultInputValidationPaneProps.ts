import { IInputValidationPaneProps } from "../../../interfaces/IInputValidationPaneProps";
import { defaultInputValidationPaneStyles } from "../defaultStyles/defaultInputValidationPaneStyles";
import { defaultInputValidationPaneControlProps } from "./defaultInputValidationPaneControlProps";

export const defaultInputValidationPaneProps: IInputValidationPaneProps = {
    controlProps: defaultInputValidationPaneControlProps,
    styleProps: defaultInputValidationPaneStyles
};