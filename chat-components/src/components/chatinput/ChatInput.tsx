import React, { useRef } from "react";
import { ChatInput as CopilotChatInput, ChatInputProps } from "@fluentui-copilot/react-chat-input";
import { CopilotProvider } from "@fluentui-copilot/react-provider";
import { CopilotTheme } from "@fluentui-copilot/react-copilot";
import { IChatInputProps } from "./interfaces/IChatInputProps";
import { defaultChatInputProps } from "./common/defaultProps/defaultChatInputProps";
import { defaultChatInputAttachmentProps } from "./common/defaultProps/defaultChatInputAttachmentProps";
import { renderDefaultAttachmentButton } from "./subcomponents/DefaultAttachmentButton";
import ChatInputAttachments from "./subcomponents/ChatInputAttachments";
import DragDropZone from "./subcomponents/DragDropZone";
import { defaultChatInputStyleProps } from "./common/defaultProps/defaultChatInputStyleProps";
import { renderDynamicStyles } from "./common/utils/styleUtils";
import { Suggestions } from "../suggestions/Suggestions";
import type { LexicalEditor } from "@fluentui-copilot/react-text-editor";
import { $getRoot } from "lexical";

/**
 * ChatInput Component - A wrapper around Fluent UI Copilot ChatInput with integrated suggestions
 */
function ChatInput(props: IChatInputProps) {
    const styleProps =  { ...defaultChatInputStyleProps, ...props.styleProps };
    const controlProps = { ...defaultChatInputProps.controlProps, ...props.controlProps };
    const componentOverrides = { ...defaultChatInputProps.componentOverrides, ...props.componentOverrides };
    const suggestionsProps = props.suggestionsProps;
    const elementId = controlProps?.chatInputId || "chat-input";
    const attachmentPreviewItems = controlProps?.attachmentProps?.attachmentPreviewItems;
    const hasAttachments = Boolean(attachmentPreviewItems?.length); // check if attachments exist
    const editorRef = useRef<LexicalEditor | null>(null);

    // Event handlers
    const handleSubmit = (_e: React.FormEvent, data: { value: string }) => {
        const value = data?.value?.trim() || "";
        
        if (value || hasAttachments) {
            const attachments = hasAttachments ? attachmentPreviewItems : undefined;
            controlProps?.onSubmitText?.(value, attachments);
            
            // Clear input after submission
            editorRef.current?.update(() => {
                $getRoot().clear().select();
            });
        }
    };

    const handleTextChange = (val: string) => {
        controlProps?.onTextChange?.(val);
    };

    // Build chat input props
    const chatInputProps = (): ChatInputProps => {
        const { onSubmitText, onTextChange, attachmentProps, sendButtonProps, ...nativeProps } = controlProps || {};
        const mergedAttachmentProps = { ...defaultChatInputAttachmentProps, ...attachmentProps };
        const slots = { 
            ...componentOverrides,
            ...(mergedAttachmentProps.showAttachButton && !componentOverrides?.contentBefore && {
                contentBefore: renderDefaultAttachmentButton({
                    onAttachmentClick: mergedAttachmentProps.onAttachmentClick,
                    onFilesSelected: mergedAttachmentProps.onFilesChange,
                    accept: mergedAttachmentProps.attachmentAccept,
                    multiple: mergedAttachmentProps.attachmentMultiple,
                    disabled: mergedAttachmentProps.attachmentButtonDisabled,
                    ariaLabel: mergedAttachmentProps.attachmentButtonAriaLabel,
                    icon: mergedAttachmentProps.attachmentButtonIcon
                })
            })
        };

        return {
            ...nativeProps,
            ...(sendButtonProps && { send: sendButtonProps }),
            ...(hasAttachments && {
                submitEnabled: true,
                attachments: (
                    <ChatInputAttachments
                        attachmentPreviewItems={attachmentPreviewItems}
                        onAttachmentRemove={mergedAttachmentProps.onAttachmentRemove}
                        maxVisibleAttachments={mergedAttachmentProps.maxVisibleAttachments}
                        overflowMenuAriaLabel={mergedAttachmentProps.overflowMenuAriaLabel}
                        {...mergedAttachmentProps}
                    />
                )
            }),
            onChange: (_e, data: { value: string }) => handleTextChange(data.value),
            onSubmit: handleSubmit,
            ...slots,
            editor: { editorRef },
        } as ChatInputProps;
    };

    // Main input component
    const chatInputComponent = (
        <CopilotProvider {...CopilotTheme} theme={controlProps?.theme} style={{ borderRadius: styleProps?.inputContainerStyleProps?.borderRadius }}>
            {renderDynamicStyles(styleProps)}
            <Suggestions {...suggestionsProps} />
            <DragDropZone
                accept={controlProps?.attachmentProps?.attachmentAccept}
                maxFiles={controlProps?.attachmentProps?.dropzoneMaxFiles}
                onFilesDropped={(files) => controlProps?.attachmentProps?.onFilesChange?.(files)}
            >
                <CopilotChatInput 
                    id={elementId}
                    {...chatInputProps()}
                    style={styleProps?.inputContainerStyleProps}
                >
                </CopilotChatInput>
            </DragDropZone>
        </CopilotProvider>
    );

    // Return wrapped component
    return (
        <div 
            id={elementId} 
            className="lcw-chat-input-box"
            style={styleProps?.containerStyleProps}
        >
            {chatInputComponent}
        </div>
    );
}

export default ChatInput;