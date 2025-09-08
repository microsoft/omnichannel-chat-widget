import type { AttachmentListProps, AttachmentProps } from "@fluentui-copilot/react-attachments";
import type { ButtonProps } from "@fluentui/react-components";

//  Attachment preview item interface.
export interface IChatPreviewAttachment {
    id: string;
    text?: string;
    progress?: number; // 0-100
    file?: File;
}

/**
 * ChatInput Attachment Props
 */
export type IChatInputAttachmentProps = Omit<AttachmentListProps, "children"> & Omit<AttachmentProps, "children"> & {
    
    // === Attachment items data ===
    attachmentPreviewItems?: ReadonlyArray<IChatPreviewAttachment>;
    
    // === Attachment button control ===
    showAttachButton?: boolean;
    attachmentButtonAriaLabel?: string;
    attachmentButtonDisabled?: boolean;
    attachmentButtonIcon?: ButtonProps["icon"];
    attachmentAccept?: string;
    attachmentMultiple?: boolean;
    onAttachmentClick?: () => void;
    // Max files when using drag-and-drop over the input
    dropzoneMaxFiles?: number;
    
    // === File handling ===
    onFilesChange?: (files: File[]) => void;
    onAttachmentRemove?: (index: number) => void;
    
    // === Additional convenience props ===
    overflowMenuAriaLabel?: string;
};
