import { ChatInputSlots } from "@fluentui-copilot/react-chat-input";
import { IChatInputControlProps } from "./IChatInputControlProps";
import { IChatInputStyleProps } from "./IChatInputStyleProps";


export interface IChatInputProps {
    componentOverrides?: ChatInputSlots; 
    controlProps?: IChatInputControlProps;
    styleProps?: IChatInputStyleProps;
}
