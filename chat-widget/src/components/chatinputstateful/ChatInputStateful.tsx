import React, { useCallback } from "react";
import { ChatInput } from "@microsoft/omnichannel-chat-components";
import { hooks as WebChatHooks } from "botframework-webchat";
import type { IChatPreviewAttachment } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputAttachmentProps";
import type { SendBoxAttachment } from "botframework-webchat-core";
import { IChatInputStatefulProps } from "./interfaces/IChatButtonStatefulParams";
import useTypingIndicator from "../../hooks/useTypingIndicator";
import useOfflineStatus from "../../hooks/useOfflineStatus";
import { useChatInputAttachments } from "./hooks/useChatInputAttachments";
import { useSuggestionsAdapter } from "./hooks/useSuggestionsAdapter";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { useStyleOptions } = WebChatHooks as any;

export const ChatInputStateful = (props: IChatInputStatefulProps) => {
    const { suggestionsProps, chatInputProps } = props;
    const isOffline = useOfflineStatus();
    const sendMessage = WebChatHooks.useSendMessage();
    const [styleOptions] = useStyleOptions();

    // Attachments management hook
    const { previewAttachments, addFiles, removeAt, clearAttachments, onPaste } = useChatInputAttachments();

    // Suggestions lifecycle hook
    const { suggestions, setShouldShowSuggestions, onSuggestionClick } = useSuggestionsAdapter();

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

    // 🎯 RUNTIME EVENT HANDLERS ONLY: Merge runtime state into pre-built props from LiveChatWidgetStateful
    // All WebChat mappings (sendTypingIndicator, hideSendBox, hideUploadButton, uploadAccept, etc.) 
    // are already processed in LiveChatWidgetStateful
    const finalChatInputProps = React.useMemo(() => ({
        ...chatInputProps,
        controlProps: {
            // Provide defaults for required properties
            charactersRemainingMessage: (remaining: number) => `${remaining} characters remaining`,
            ...chatInputProps?.controlProps,
            // Runtime event handlers
            onSubmitText: handleSend,
            onTextChange: handleTextChange,
            onPaste: onPaste,
            // Runtime attachment handling  
            attachmentProps: {
                ...chatInputProps?.controlProps?.attachmentProps,
                attachmentPreviewItems: previewAttachments,
                onAttachmentRemove: handleRemoveAttachment,
                onFilesChange: handleFilesChange
            }
        }
    }), [
        chatInputProps, 
        handleSend, 
        handleTextChange, 
        onPaste, 
        previewAttachments, 
        handleRemoveAttachment, 
        handleFilesChange
    ]);

    // Create callback for clearing suggestions
    const handleSuggestionsClear = useCallback(() => {
        setShouldShowSuggestions(false);
    }, [setShouldShowSuggestions]);

    const finalSuggestionsProps = React.useMemo(() => ({
        ...suggestionsProps,
        controlProps: {
            ...suggestionsProps?.controlProps,
            // Runtime suggestions lifecycle
            suggestions,
            onSuggestionClick,
            onSuggestionsClear: handleSuggestionsClear,
            autoHide: true
        }
    }), [
        suggestionsProps,
        suggestions,
        onSuggestionClick,
        handleSuggestionsClear
    ]);

    return (
        <ChatInput
            chatInputProps={finalChatInputProps}
            suggestionsProps={finalSuggestionsProps}
        />
    );
};

export default ChatInputStateful;