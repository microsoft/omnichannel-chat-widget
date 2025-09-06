import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChatInput } from "@microsoft/omnichannel-chat-components";
import { hooks as WebChatHooks } from "botframework-webchat"; // Only for send, suggestions, card actions
import type { SendBoxAttachment } from "botframework-webchat-core";
import { useFileUploadProgress } from "../../hooks/useFileUploadProgress";
import { getDefaultControlProps } from "./common/defaultProps/defaultControlProps";
import { getDefaultStyleProps } from "./common/defaultProps/defaultStyleProps";
import { ISuggestionItem } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionItem";
import { IChatInputStatefulProps } from "./interfaces/IChatButtonStatefulParams";
import useTypingIndicator from "../../hooks/useTypingIndicator";
import useOfflineStatus from "../../hooks/useOfflineStatus";
import { IChatPreviewAttachment } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputAttachmentProps";

const { useSuggestedActions, usePerformCardAction, useActivities } = WebChatHooks;

export const ChatInputStateful: React.FC<IChatInputStatefulProps> = (props) => {
    const { suggestionsProps, chatInputProps } = props;
    const isOffline = useOfflineStatus();
    const { simulateUpload, cancelUpload, getProgress } = useFileUploadProgress();
    
    const [webChatSuggestedActions] = useSuggestedActions();
    const performCardAction = usePerformCardAction();
    const [activities] = useActivities();
    const sendMessage = WebChatHooks.useSendMessage();
    const { useStyleOptions } = WebChatHooks as any;
    const [styleOptions] = useStyleOptions();
    
    
    const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
    const [lastActivityId, setLastActivityId] = useState<string | null>(null);
    const [previewAttachments, setPreviewAttachments] = useState<IChatPreviewAttachment[]>([]);
    
    // Create attachment preview items with progress for ChatInput
    const attachmentPreviewItems: ReadonlyArray<IChatPreviewAttachment> = useMemo(() => previewAttachments.map(att => ({
        id: att.id,
        text: att.text || att.file?.name,
        progress: (() => { const p = getProgress(att.id); return p !== undefined ? p / 100 : undefined; })(),
        file: att.file
    })), [previewAttachments, getProgress]);

    // Handle file attachment selection (optimized)
    const handleFilesSelected = useCallback((files: File[]) => {
        if (!files?.length) return;
        const ts = Date.now();
        const newItems: IChatPreviewAttachment[] = files.map((file, i) => ({
            id: `${ts}-${i}`,
            file,
            text: file.name
        }));
        setPreviewAttachments(prev => [...prev, ...newItems]);
        newItems.forEach(a => simulateUpload(a.id));
    }, [simulateUpload]);

    // Handle paste events (optimized)
    const handlePaste = useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items; if (!items) return;
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) { if (items[i].kind === "file") { const f = items[i].getAsFile(); if (f) files.push(f); } }
        if (files.length) { handleFilesSelected(files); event.preventDefault(); }
    }, [handleFilesSelected]);

    // Handle removing attachment
    const handleRemoveAttachment = useCallback((index: number) => {
        const attachmentToRemove = previewAttachments[index];
        if (attachmentToRemove) {
            cancelUpload(attachmentToRemove.id);
            setPreviewAttachments(prev => prev.filter((_, i) => i !== index));
        }
    }, [previewAttachments, cancelUpload]);

    // Handle message sending
    const handleSend = useCallback((message: string, attachments?: ReadonlyArray<IChatPreviewAttachment>) => {
        if (isOffline) return false;
        const toSend = attachments?.length ? attachments : attachmentPreviewItems;
        const files: File[] = toSend.map(a => a.file).filter((f): f is File => !!f);
        const webChatAttachments: SendBoxAttachment[] = files.map(f => ({ blob: f }));
        if (!message && !webChatAttachments.length) return false;
        try {
            sendMessage(message || undefined, "keyboard", webChatAttachments.length ? { attachments: webChatAttachments } : undefined);
            setPreviewAttachments([]);
            return true;
        } catch {
            return false;
        }
    }, [sendMessage, attachmentPreviewItems, isOffline]);

    const handleTextChange = useTypingIndicator({ enabled: !!styleOptions.sendTypingIndicator, canSend: !isOffline });

    // Handle suggestion clicks
    const handleSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        try {
            const val = suggestion.value;
            const isCardActionObject = !!val && typeof val === "object" && "type" in (val as Record<string, unknown>);

            if (isCardActionObject) {
                performCardAction(val);
            } else {
                console.error("Error performing card action:", suggestion);
            }
            setShouldShowSuggestions(false);
        } catch (error) {
            console.warn("Error performing card action:", error);
        }
    }, [performCardAction]);

    // Convert WebChat actions to suggestions format
    const convertedSuggestions = useMemo(() => {
        if (!webChatSuggestedActions?.length || !shouldShowSuggestions) return [];
        return webChatSuggestedActions.map((action: unknown) => {
            const a = action as Record<string, unknown>;
            return {
                text: (a.title || a.text || a.displayText || "Action") as string,
                value: a,
                displayText: (a.displayText || a.title || a.text) as string,
                type: (a.type || "postBack") as string,
                disabled: false
            };
        });
    }, [webChatSuggestedActions, shouldShowSuggestions]);

    // Build control props
    const controlProps = useMemo(() => {
        const defaultProps = getDefaultControlProps();
        const customControlProps = chatInputProps?.controlProps;

        return {
            ...defaultProps,
            ...customControlProps,
            onSubmitText: handleSend,
            onTextChange: handleTextChange,
            onPaste: handlePaste,
            attachmentProps: {
                ...defaultProps.attachmentProps,
                ...customControlProps?.attachmentProps,
                attachmentPreviewItems,
                onAttachmentRemove: handleRemoveAttachment,
                onFilesChange: handleFilesSelected,
            },
        };
    }, [
        handleSend, 
        handleTextChange,
        handlePaste,
        handleFilesSelected,
        attachmentPreviewItems,
        handleRemoveAttachment,
        chatInputProps?.controlProps
    ]);

    // Build style props
    const styleProps = useMemo(() => ({
        ...getDefaultStyleProps(),
        ...chatInputProps?.styleProps
    }), [chatInputProps?.styleProps]);

    // Build suggestions props
    const suggestedActionsProps = useMemo(() => {
        const upstream = suggestionsProps || {};
        return {
            controlProps: {
                ...upstream.controlProps,
                suggestions: convertedSuggestions,
                onSuggestionClick: handleSuggestionClick,
                onSuggestionsClear: () => setShouldShowSuggestions(false),
                autoHide: true,
                horizontalAlignment: upstream.controlProps?.horizontalAlignment
            },
            styleProps: upstream.styleProps,
            componentOverrides: upstream.componentOverrides
        };
    }, [suggestionsProps, convertedSuggestions, handleSuggestionClick]);


    // Monitor WebChat suggestions
    useEffect(() => {
        if (webChatSuggestedActions?.length > 0) {
            setShouldShowSuggestions(true);
        }
    }, [webChatSuggestedActions]);

    // Monitor activities to hide suggestions
    useEffect(() => {
        if (activities.length > 0) {
            const latestActivity = activities[activities.length - 1];
            if (latestActivity.id && latestActivity.id !== lastActivityId) {
                setLastActivityId(latestActivity.id);
                if (latestActivity.from?.role === "user") {
                    setShouldShowSuggestions(false);
                }
            }
        }
    }, [activities, lastActivityId]);


    return (
        <ChatInput
            chatInputProps={{ controlProps, styleProps, componentOverrides: chatInputProps?.componentOverrides }}
            suggestionsProps={suggestedActionsProps}
        />
    );
};

export default ChatInputStateful;