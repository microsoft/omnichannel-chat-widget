import React, { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { ChatInput } from "@microsoft/omnichannel-chat-components";
import { hooks as WebChatHooks } from "botframework-webchat"; // Only for send, suggestions, card actions
import useFacadeChatSDKStore from "../../hooks/useFacadeChatSDKStore";
import type { SendBoxAttachment } from "botframework-webchat-core";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import useChatContextStore from "../../hooks/useChatContextStore";
import { ConversationState } from "../../contexts/common/ConversationState";
import { useFileUploadProgress } from "../../hooks/useFileUploadProgress";
import { getDefaultControlProps } from "./common/defaultProps/defaultControlProps";
import { getDefaultStyleProps } from "./common/defaultProps/defaultStyleProps";
import { ISuggestionItem } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionItem";
import { IChatInputStatefulProps } from "./interfaces/IChatButtonStatefulParams";
import useTypingIndicator from "../../hooks/useTypingIndicator";
import useOfflineStatus from "../../hooks/useOfflineStatus";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { useSuggestedActions, usePerformCardAction, useActivities } = WebChatHooks as any;

export const ChatInputStateful: React.FC<IChatInputStatefulProps> = (props) => {
    const { suggestionsProps, chatInputProps } = props;
    const isOffline = useOfflineStatus();
    const [webChatSuggestedActions] = useSuggestedActions();
    const performCardAction = usePerformCardAction();
    const [activities] = useActivities();
    const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
    const [lastActivityId, setLastActivityId] = useState<string | null>(null);
    const [state]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // Send eligibility now only depends on offline status (hideSendBox managed upstream)
    const sendMessage = WebChatHooks.useSendMessage();
    const [facadeChatSDK] = useFacadeChatSDKStore();
    const { simulateUpload, cancelUpload, getProgress } = useFileUploadProgress();
    const [previewAttachments, setPreviewAttachments] = useState<Array<{ 
        id: string; 
        text: string; 
        _file: File;
    }>>([]);
    const isMinimized = state.appStates.isMinimized;
    
    // Create attachment preview items with progress for ChatInput
    const attachmentPreviewItems = useMemo(() => previewAttachments.map(att => ({
        id: att.id,
        text: att.text,
        progress: (() => { const p = getProgress(att.id); return p !== undefined ? p / 100 : undefined; })(),
        _file: att._file
    })), [previewAttachments, getProgress]);

    // Handle file attachment selection (optimized)
    const handleFilesSelected = useCallback((files: File[]) => {
        if (!files?.length) return;
        const ts = Date.now();
        const newItems = files.map((file, i) => ({
            id: `${ts}-${i}`,
            text: file.name,
            _file: file,
            file,
            blob: file
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

    // Early return if component should be hidden
    if (isMinimized || state.appStates.conversationState !== ConversationState.Active) {
        return null;
    }

    // Handle message sending
    const handleSend = useCallback((message: string, attachments?: ReadonlyArray<{ id: string; text?: string; progress?: number; _file?: File; }>) => {
        if (isOffline) return false;
        const toSend = attachments?.length ? attachments : previewAttachments;
        const webChatAttachments: SendBoxAttachment[] = toSend.filter(a => !!a._file).map(a => ({ blob: a._file as File }));
        const text = message.trim();
        if (!text && !webChatAttachments.length) return false;
        try {
            sendMessage(text || undefined, "keyboard", webChatAttachments.length ? { attachments: webChatAttachments } : undefined);
            setPreviewAttachments([]);
            return true;
        } catch {
            return false;
        }
    }, [sendMessage, previewAttachments, isOffline]);

    const handleTextChange = useTypingIndicator({
        enabled: true,
        canSend: !isOffline,
        sendTyping: () => facadeChatSDK?.sendTypingEvent()
    });

    // Handle suggestion clicks
    const handleSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        try {
            const val = suggestion.value;
            const isCardActionObject = !!val && typeof val === "object" && "type" in (val as Record<string, unknown>);

            if (isCardActionObject) {
                // Forward the original Web Chat card action to Web Chat to let existing middlewares handle it
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                performCardAction(val as any);
            } else {
                // Fallback: construct a minimal card action from suggestion fields
                const rawValue = val ?? suggestion.text;
                const valueStr = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
                const type = suggestion.type ?? "imBack";

                performCardAction({
                    type,
                    value: valueStr,
                    title: suggestion.text,
                    displayText: suggestion.displayText ?? suggestion.text
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any);
            }

            setShouldShowSuggestions(false);
        } catch (error) {
            console.warn("Error performing card action:", error);
        }
    }, [performCardAction]);

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

    // Build suggestions props in new structure (controlProps/styleProps/componentOverrides)
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

    return (
        <ChatInput
            chatInputProps={{ controlProps, styleProps, componentOverrides: chatInputProps?.componentOverrides }}
            suggestionsProps={suggestedActionsProps}
        />
    );
};

export default ChatInputStateful;