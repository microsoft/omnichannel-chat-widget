import { IConfirmationPaneComponentOverrides } from "./IConfirmationPaneComponentOverrides";
import { IConfirmationPaneControlProps } from "./IConfirmationPaneControlProps";
import { IConfirmationPaneStyleProps } from "./IConfirmationPaneStyleProps";

export interface IConfirmationPaneProps {
    componentOverrides?: IConfirmationPaneComponentOverrides;
    controlProps?: IConfirmationPaneControlProps;
    styleProps?: IConfirmationPaneStyleProps;
}