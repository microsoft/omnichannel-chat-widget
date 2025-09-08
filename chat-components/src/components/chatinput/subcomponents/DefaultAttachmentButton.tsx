import React from "react";
import { Button, ButtonProps } from "@fluentui/react-components";
import { Add24Regular } from "@fluentui/react-icons";

export interface IDefaultAttachmentButtonProps {
    onAttachmentClick?: () => void;
    onFilesSelected?: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    ariaLabel?: string;
    icon?: ButtonProps["icon"];
}

/**
 * Renders a default attachment button component that allows users to upload files.
 * @param props - Configuration options for the attachment button
 */
export const renderDefaultAttachmentButton = (props: IDefaultAttachmentButtonProps = {}): React.ReactElement => {
    const {
        onAttachmentClick,
        onFilesSelected,
        accept = "*/*",
        multiple = true,
        disabled,
        ariaLabel = "Attach file",
        icon = <Add24Regular />
    } = props;

    const handleButtonClick = () => {
        if (onAttachmentClick) {
            onAttachmentClick();
            return;
        }

        // Default file selection behavior
        const input = document.createElement("input");
        input.type = "file";
        input.accept = accept;
        input.multiple = multiple;
        
        input.onchange = (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files?.length && onFilesSelected) {
                onFilesSelected(Array.from(files));
            }
            input.remove();
        };
        
        input.click();
    };

    return (
        <Button
            className="fai-ChatInput__attachmentButton"
            appearance="transparent"
            shape="circular"
            icon={icon}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={handleButtonClick}
        />
    );
};
