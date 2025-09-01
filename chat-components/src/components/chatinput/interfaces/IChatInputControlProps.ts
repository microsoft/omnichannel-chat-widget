import React from "react";
import type { ChatInputProps, SendButtonProps } from "@fluentui-copilot/react-chat-input";
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
    onSubmitText?: (value: string, attachments?: ReadonlyArray<IChatInputAttachmentItem>) => void;
    onTextChange?: (value: string) => void;

    // === Attachment configuration ===
    attachmentProps?: IChatInputAttachmentProps;

    // === Send button configuration ===
    sendButtonProps?: Partial<SendButtonProps>;
    // === Theme configuration ===
    theme?: Theme;

    // === Additional accessibility ===
    chatInputAriaLabel?: string;
    chatInputId?: string;
}
