import { webLightTheme } from "@fluentui/react-components";
import { IChatInputControlProps } from "../../interfaces/IChatInputControlProps";
import { defaultChatInputAttachmentProps } from "./defaultChatInputAttachmentProps";

export const defaultChatInputControlProps: IChatInputControlProps = {
    // === Spread attachment defaults ===
    attachmentProps: defaultChatInputAttachmentProps,

    // === Core functionality ===
    disabled: false,
    showCount: false,
    maxLength: 500,
    placeholderValue: "Type a message...",
    charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,

    // === ChatInput appearance and behavior ===
    appearance: "responsive", // 'auto' | 'multi' | 'single' | 'responsive';
    characterLimitErrorMessage: "Character limit exceeded!",
    disableSend: false,
    
    // === Accessibility ===
    chatInputAriaLabel: "Chat input field",
    chatInputId: "chat-input",
    dragDropOverlayText: "Drop files here to attach",

    // === Theme ===
    theme: webLightTheme,

};
