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
import { ISuggestionsProps } from "../suggestions/interfaces/ISuggestionsProps";
import { defaultChatInputControlProps } from "./common/defaultProps/defaultChatInputControlProps";
import { deepMerge } from "../../common/utils";

/**
 * ChatInput Component - A wrapper around Fluent UI Copilot ChatInput with integrated suggestions
 */
function ChatInput(props: {chatInputProps: IChatInputProps; suggestionsProps?: ISuggestionsProps }) {
    const { chatInputProps, suggestionsProps } = props;
    // Deep merge style props (generic util) so partial nested overrides augment defaults
    const styleProps = deepMerge(defaultChatInputStyleProps, chatInputProps.styleProps);
    const controlProps = deepMerge(defaultChatInputControlProps, chatInputProps.controlProps);
    const componentOverrides = deepMerge(defaultChatInputProps.componentOverrides, chatInputProps.componentOverrides);
    const editorRef = useRef<LexicalEditor | null>(null);
    const attachmentPreviewItems = controlProps?.attachmentProps?.attachmentPreviewItems;
    
    const hasAttachments = Boolean(attachmentPreviewItems?.length); // check if attachments exist

    // Event handlers
    const handleSubmit = (_e: React.FormEvent, data: { value: string }) => {
        const value = data?.value?.trim() || "";
        if (!value && !hasAttachments) return; // nothing to submit
        const attachments = hasAttachments ? attachmentPreviewItems : undefined;

        const clearEditor = () => {
            editorRef.current?.update(() => { $getRoot().clear().select(); });
            if (hasAttachments) {
                controlProps?.attachmentProps?.onFilesChange?.([]);
            }
        };

        try {
            const result = controlProps?.onSubmitText?.(value, attachments);
            if (result !== false) {
                clearEditor();
            }
        } catch (err) {
            console.error("Error submitting chat input:", err);
        }
    };

    const handleTextChange = (val: string) => {
        controlProps?.onTextChange?.(val);
    };

    // Build attachments element
    const attachmentsComponent = hasAttachments ? (
        <ChatInputAttachments
            attachmentPreviewItems={attachmentPreviewItems}
            onAttachmentRemove={controlProps?.attachmentProps?.onAttachmentRemove}
            maxVisibleAttachments={controlProps?.attachmentProps?.maxVisibleAttachments}
            overflowMenuAriaLabel={controlProps?.attachmentProps?.overflowMenuAriaLabel}
            {...controlProps?.attachmentProps}
        />
    ) : undefined;

    // Build chat input props
    const inputBoxProps = (): ChatInputProps => {
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
                attachments: attachmentsComponent
            }),
            onChange: (_e, data: { value: string }) => handleTextChange(data.value),
            onSubmit: handleSubmit,
            ...slots,
            editor: { editorRef },
        } as ChatInputProps;
    };

    // Generate dynamic styles directly
    const dynamicStylesElement = renderDynamicStyles(styleProps);

    console.log("chat input props new:", controlProps, styleProps, suggestionsProps);
    // Main input component
    const chatInputComponent = (
        <CopilotProvider {...CopilotTheme} theme={controlProps.theme} style={{ borderRadius: styleProps?.inputContainerStyleProps?.borderRadius }}>
            {dynamicStylesElement}
            <Suggestions {...suggestionsProps} />
            <DragDropZone
                accept={controlProps?.attachmentProps?.attachmentAccept}
                maxFiles={controlProps?.attachmentProps?.dropzoneMaxFiles}
                onFilesDropped={(files) => controlProps?.attachmentProps?.onFilesChange?.(files)}
                overlayStyleProps={styleProps.dragDropOverlayStyleProps}
                overlayText={controlProps.dragDropOverlayText}
            >
                <CopilotChatInput
                    {...inputBoxProps()}
                    style={styleProps?.inputContainerStyleProps}
                >
                </CopilotChatInput>
            </DragDropZone>
        </CopilotProvider>
    );

    if (controlProps.hideSendBox === true) {
        return null;
    }

    return (
        <div
            id={controlProps.chatInputId}
            className="lcw-chat-input-box"
            style={styleProps?.containerStyleProps}
        >
            {chatInputComponent}
        </div>
    );
}

export default ChatInput;