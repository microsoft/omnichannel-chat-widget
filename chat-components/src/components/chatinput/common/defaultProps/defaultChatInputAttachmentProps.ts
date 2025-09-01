import { IChatInputAttachmentProps } from "../../interfaces/IChatInputAttachmentProps";

export const defaultChatInputAttachmentProps: IChatInputAttachmentProps = {
    // === Attachment button props ===
    attachmentButtonAriaLabel: "Add attachment",
    attachmentButtonDisabled: false,
    attachmentAccept: "*/*",
    attachmentMultiple: true,
    
    // === Attachment preview configuration ===
    maxVisibleAttachments: 1,
    overflowMenuAriaLabel: "View and remove additional attachments",
    
    // === File handling ===
    onFilesChange: undefined,
    
    // === Features ===
    showAttachButton: true,
};
