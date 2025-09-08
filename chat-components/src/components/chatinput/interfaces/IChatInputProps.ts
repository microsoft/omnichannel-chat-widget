import { ChatInputSlots } from "@fluentui-copilot/react-chat-input";
import { IChatInputControlProps } from "./IChatInputControlProps";
import { IChatInputStyleProps } from "./IChatInputStyleProps";
import { ISuggestionsProps } from "../../suggestions/interfaces/ISuggestionsProps";

/**
 * Properties interface for the ChatInput component.
 * 
 * @interface IChatInputProps
 * @description Defines the configuration options available for customizing the ChatInput component's
 * appearance, behavior, and structure through various prop categories.
 */
export interface IChatInputProps {
    componentOverrides?: ChatInputSlots; 
    controlProps?: IChatInputControlProps;
    styleProps?: IChatInputStyleProps;
}
