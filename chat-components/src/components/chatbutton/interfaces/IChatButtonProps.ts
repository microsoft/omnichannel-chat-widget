import { IChatButtonStyleProps } from "./IChatButtonStyleProps";
import { IChatButtonControlProps } from "./IChatButtonControlProps";
import { IChatButtonComponentOverrides } from "./IChatButtonComponentOverrides";

export interface IChatButtonProps {
    componentOverrides?: IChatButtonComponentOverrides; 
    controlProps?: IChatButtonControlProps;
    styleProps?: IChatButtonStyleProps;
}