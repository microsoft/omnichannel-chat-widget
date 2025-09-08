import type { ChatInputLineModeData, ChatInputProps, SendButtonProps } from "@fluentui-copilot/react-chat-input";
import type { Theme } from "@fluentui/react-components";
import { IChatInputAttachmentProps } from "./IChatInputAttachmentProps";

// Attachment item structure
export interface IChatInputAttachmentItem {
    id: string;
    text?: string;
    progress?: number;
}

/**
 * ChatInput Control Props - extends native Copilot ChatInputProps
 */
export interface IChatInputControlProps extends Omit<ChatInputProps, "onSubmit"> {
    
    // === event handlers ===
    onSubmitText?: (value: string, attachments?: ReadonlyArray<IChatInputAttachmentItem>) => void | boolean;
    onTextChange?: (value: string) => void;
    charactersRemainingMessage: (remaining: number) => string;
    onLineModeChange?: (newState: ChatInputLineModeData) => void;

    // === Attachment configuration ===
    attachmentProps?: IChatInputAttachmentProps;

    // === Send button configuration ===
    sendButtonProps?: Partial<SendButtonProps>;

    // === Theme configuration ===
    theme?: Theme;

    // === Additional accessibility ===
    chatInputAriaLabel?: string;
    chatInputId?: string;

    // === Drag & Drop overlay text customization ===
    dragDropOverlayText?: string;

    hideSendBox?: boolean;
}
