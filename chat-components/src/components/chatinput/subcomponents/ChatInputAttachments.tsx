import React from "react";
import {
    Attachment,
    AttachmentList,
    AttachmentOverflowMenuButton
} from "@fluentui-copilot/react-attachments";
import type { AttachmentListProps } from "@fluentui-copilot/react-attachments";
import { IChatInputAttachmentProps } from "../interfaces/IChatInputAttachmentProps";
import getFileIcon from "../common/utils/getFileIcon";

/**
 * Chat input attachment component that renders a list of file attachments with preview, removal capabilities, and overflow handling.
 * @param props - The properties for configuring the chat input attachments component
 */
function ChatInputAttachments(props: IChatInputAttachmentProps) {
    const {
        attachmentPreviewItems,
        onAttachmentRemove,
        maxVisibleAttachments = 3,
        overflowMenuAriaLabel = "View and remove additional attachments",
        size,
        imageOnly,
        dismissOnly,
        mode,
        designVersion,
        className,
        overflowMenuProps,
        ...restProps
    } = props;

    // Early return for empty attachments
    if (!attachmentPreviewItems?.length) {
        return null;
    }

    const handleDismiss: AttachmentListProps["onAttachmentDismiss"] = (_, data) => {
        if (!data?.id) return;
        
        const index = attachmentPreviewItems.findIndex(item => item.id === data.id);
        if (index >= 0) {
            onAttachmentRemove?.(index);
        }
    };

    // Create attachment props object to avoid repetition
    const attachmentProps = {
        size,
        imageOnly,
        dismissOnly,
        mode,
        designVersion
    };

    return (
        <AttachmentList
            onAttachmentDismiss={handleDismiss}
            maxVisibleAttachments={maxVisibleAttachments}
            className={className}
            overflowMenuProps={overflowMenuProps}
            designVersion={designVersion}
            overflowMenuButton={
                <AttachmentOverflowMenuButton 
                    aria-label={overflowMenuAriaLabel}
                />
            }
            {...restProps}
        >
            {attachmentPreviewItems.map(({ id, text, progress }) => (
                <Attachment
                    key={id}
                    id={id}
                    media={getFileIcon(text)}
                    {...attachmentProps}
                    {...(progress !== undefined && { progress: { value: progress } })}
                >
                    {text}
                </Attachment>
            ))}
        </AttachmentList>
    );
}

export default ChatInputAttachments;
