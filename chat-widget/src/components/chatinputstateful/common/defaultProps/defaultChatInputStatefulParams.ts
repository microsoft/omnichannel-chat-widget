import { IChatInputStatefulParams } from "../../interfaces/IChatInputStatefulParams";

export const defaultChatInputStatefulParams: IChatInputStatefulParams = {
    hideTextInput: false,
    isMinimized: false,
    chatInputProps: {
        controlProps: {
            disabled: false,
            placeholderValue: "Type a message...",
            maxLength: 500,
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`
        }
    }
};
