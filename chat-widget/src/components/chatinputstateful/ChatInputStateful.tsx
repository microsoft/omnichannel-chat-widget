import React, { useCallback, useMemo } from "react";
import { ChatInput } from "@microsoft/omnichannel-chat-components";
import { hooks as WebChatHooks } from "botframework-webchat";
import type { IChatPreviewAttachment } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputAttachmentProps";
import type { SendBoxAttachment } from "botframework-webchat-core";
import { getDefaultControlProps } from "./common/defaultProps/defaultControlProps";
import { getDefaultStyleProps } from "./common/defaultProps/defaultStyleProps";
import { IChatInputStatefulProps } from "./interfaces/IChatButtonStatefulParams";
import useTypingIndicator from "../../hooks/useTypingIndicator";
import useOfflineStatus from "../../hooks/useOfflineStatus";
import { useChatInputAttachments } from "./hooks/useChatInputAttachments";
import { useSuggestionsState } from "./hooks/useSuggestionsState";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { useStyleOptions } = WebChatHooks as any;

export const ChatInputStateful = (props: IChatInputStatefulProps) => {
    const { suggestionsProps, chatInputProps } = props;
    const isOffline = useOfflineStatus();
    const sendMessage = WebChatHooks.useSendMessage();
    const [styleOptions] = useStyleOptions();

    // Attachments management hook
    const { previewAttachments, addFiles, removeAt, clearAttachments, onPaste } = useChatInputAttachments();

    // Handle file attachment selection / replacement semantics
    const handleFilesChange = useCallback((files?: File[] | null) => {
        if (!files || files.length === 0) {
            clearAttachments();
            return;
        }
        addFiles(files);
    }, [addFiles, clearAttachments]);

    // Handle removing attachment
    const handleRemoveAttachment = removeAt;

    // Handle message sending using webchat hook
    const handleSend = useCallback((message: string, attachments?: ReadonlyArray<IChatPreviewAttachment>) => {
        if (isOffline) return false;
        const usingLocal = attachments === previewAttachments || !attachments?.length;
        const toSend = usingLocal ? previewAttachments : attachments;
        const files: File[] = [...toSend]
            .map(a => (a as { file?: File }).file)
            .filter((f): f is File => !!f);
        const webChatAttachments: SendBoxAttachment[] = files.map(f => ({ blob: f }));
        if (!message && !webChatAttachments.length) return false;
        try {
            sendMessage(message || undefined, "keyboard", webChatAttachments.length ? { attachments: webChatAttachments } : undefined);
            if (usingLocal) {
                clearAttachments();
            }
            return true;
        } catch (e) {
            return false;
        }
    }, [sendMessage, previewAttachments, isOffline, clearAttachments]);

    // typing indicator
    const sendTypingEnabled = Boolean((styleOptions as unknown as { sendTypingIndicator?: boolean })?.sendTypingIndicator);
    const handleTextChange = useTypingIndicator({ enabled: sendTypingEnabled, canSend: !isOffline });


    // Build control props
    const controlProps = useMemo(() => {
        const defaultProps = getDefaultControlProps();
        const customControlProps = chatInputProps?.controlProps;

        return {
            ...defaultProps,
            ...customControlProps,
            onSubmitText: handleSend,
            onTextChange: handleTextChange,
            onPaste: onPaste,
            attachmentProps: {
                ...defaultProps.attachmentProps,
                ...customControlProps?.attachmentProps,
                attachmentPreviewItems: previewAttachments,
                onAttachmentRemove: handleRemoveAttachment,
                onFilesChange: handleFilesChange,
            },
        };
    }, [
        handleSend,
        handleTextChange,
        onPaste,
        handleFilesChange,
        previewAttachments,
        handleRemoveAttachment,
        chatInputProps?.controlProps
    ]);

    // Build style props
    const styleProps = useMemo(() => ({
        ...getDefaultStyleProps(),
        ...chatInputProps?.styleProps
    }), [chatInputProps?.styleProps]);

    // Suggestions props
    const { suggestionsProps: mergedSuggestionsProps } = useSuggestionsState({ props: suggestionsProps });

    return (
        <ChatInput
            chatInputProps={{ controlProps, styleProps, componentOverrides: chatInputProps?.componentOverrides }}
            suggestionsProps={mergedSuggestionsProps}
        />
    );
};

export default ChatInputStateful;