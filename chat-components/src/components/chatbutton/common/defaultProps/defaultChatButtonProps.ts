import { IChatButtonProps } from "../../interfaces/IChatButtonProps";
import { defaultChatButtonStyleProps } from "../defaultStyles/defaultChatButtonStyleProps";
import { defaultChatButtonControlProps } from "./defaultChatButtonControlProps";

export const defaultChatButtonProps: IChatButtonProps = {
    controlProps: defaultChatButtonControlProps,
    styleProps: defaultChatButtonStyleProps
};