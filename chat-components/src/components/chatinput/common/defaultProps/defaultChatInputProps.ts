import { IChatInputProps } from "../../interfaces/IChatInputProps";
import { defaultChatInputStyleProps } from "./defaultChatInputStyleProps";
import { defaultChatInputControlProps } from "./defaultChatInputControlProps";

export const defaultChatInputProps: IChatInputProps = {
    controlProps: defaultChatInputControlProps,
    styleProps: defaultChatInputStyleProps,
    componentOverrides: {
        root: "",
        inputWrapper: "",
        editor: "",
        actions: ""
    }
};
