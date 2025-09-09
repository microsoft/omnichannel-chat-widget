import { ICitationPaneComponentOverrides } from "./ICitationPaneComponentOverrides";
import { ICitationPaneControlProps } from "./ICitationPaneControlProps";
import { ICitationPaneStyleProps } from "./ICitationPaneStyleProps";

export interface ICitationPaneProps {
    controlProps?: ICitationPaneControlProps;
    styleProps?: ICitationPaneStyleProps;
    componentOverrides?: ICitationPaneComponentOverrides;
}