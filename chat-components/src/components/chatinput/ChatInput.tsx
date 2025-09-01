import React, { useRef, useState } from "react";
import { ChatInput as CopilotChatInput, ChatInputProps } from "@fluentui-copilot/react-chat-input";
import { ImperativeControlPlugin } from "@fluentui-copilot/react-copilot";
import type { ImperativeControlPluginRef } from "@fluentui-copilot/react-copilot";
import { CopilotProvider } from "@fluentui-copilot/react-provider";
import { CopilotTheme } from "@fluentui-copilot/react-copilot";
import { IChatInputProps } from "./interfaces/IChatInputProps";
import { defaultChatInputProps } from "./common/defaultProps/defaultChatInputProps";
import { defaultChatInputAttachmentProps } from "./common/defaultProps/defaultChatInputAttachmentProps";
import { renderDefaultAttachmentButton } from "./subcomponents/DefaultAttachmentButton";
import ChatInputAttachments from "./subcomponents/ChatInputAttachments";
import { defaultChatInputStyleProps } from "./common/defaultProps/defaultChatInputStyleProps";
import { renderDynamicStyles } from "./common/utils/styleUtils";

/**
 * ChatInput Component - A wrapper around Fluent UI Copilot ChatInput
 */
function ChatInput(props: IChatInputProps) {
    const styleProps =  { ...defaultChatInputStyleProps, ...props.styleProps };
    const controlProps = { ...defaultChatInputProps.controlProps, ...props.controlProps };
    const componentOverrides = { ...defaultChatInputProps.componentOverrides, ...props.componentOverrides };
    const elementId = controlProps?.chatInputId || "chat-input";
    
    const attachmentPreviewItems = controlProps?.attachmentProps?.attachmentPreviewItems;
    const [inputText, setInputText] = useState<string>("");
    const controlRef = useRef<ImperativeControlPluginRef>(null);
    const hasAttachments = Boolean(attachmentPreviewItems?.length); // check if attachments exist

    // Event handlers
    const handleSubmit = (_e: React.FormEvent, data: { value: string }) => {
        const value = data?.value?.trim() || "";
        
        if (value || hasAttachments) {
            const attachments = hasAttachments ? attachmentPreviewItems : undefined;
            controlProps?.onSubmitText?.(value, attachments);
            
            // Clear input after submission
            setInputText("");
            controlRef.current?.setInputText("");
        }
    };

    const handleTextChange = (val: string) => {
        setInputText(val);
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
            ...slots
        } as ChatInputProps;
    };

    // Main input component
    const chatInputComponent = (
        <CopilotProvider {...CopilotTheme} theme={controlProps?.theme}>
            {renderDynamicStyles(styleProps)}
            <CopilotChatInput 
                id={elementId}
                {...chatInputProps()}
                style={styleProps?.inputContainerStyleProps}
            >
                <ImperativeControlPlugin ref={controlRef} />
            </CopilotChatInput>
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