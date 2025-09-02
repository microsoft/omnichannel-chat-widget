import { IChatInputControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputControlProps";

/**
 * Default control props configuration for ChatInput component
 */
export const getDefaultControlProps = (): IChatInputControlProps => ({
    disabled: false,
    placeholderValue: "Ask your questions...",
    maxLength: 100,
    showCount: true,
    charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
    
    // Attachment configuration
    attachmentProps: {
        showAttachButton: true,
        attachmentAccept: "*/*",
        attachmentMultiple: true,
        size: "medium" as const,
        maxVisibleAttachments: 3,
        overflowMenuAriaLabel: "View additional attachments",
    }
});