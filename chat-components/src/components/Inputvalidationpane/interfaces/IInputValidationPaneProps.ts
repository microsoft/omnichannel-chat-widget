import { IInputValidationPaneComponentOverrides } from "./IInputValidationPaneComponentOverrides";
import { IInputValidationPaneControlProps } from "./IInputValidationPaneControlProps";
import { IInputValidationPaneStyleProps } from "./IInputValidationPaneStyleProps";

export interface IInputValidationPaneProps {
    componentOverrides?: IInputValidationPaneComponentOverrides;
    controlProps?: IInputValidationPaneControlProps;
    styleProps?: IInputValidationPaneStyleProps;
}