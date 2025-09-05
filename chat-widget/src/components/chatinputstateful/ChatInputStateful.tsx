import React, { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { ChatInput } from "@microsoft/omnichannel-chat-components";
import { hooks as WebChatHooks } from "botframework-webchat";
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

const { useSuggestedActions, usePerformCardAction, useActivities, useStyleOptions } = WebChatHooks as any;

export const ChatInputStateful: React.FC<IChatInputStatefulProps> = (props) => {
    const { suggestionsProps, chatInputProps } = props;
    const [webChatSuggestedActions] = useSuggestedActions();
    const performCardAction = usePerformCardAction();
    const [activities] = useActivities();
    const [styleOptions] = typeof useStyleOptions === "function" ? useStyleOptions() : [{}];
    const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
    const [lastActivityId, setLastActivityId] = useState<string | null>(null);
    const [state]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const sendMessage = WebChatHooks.useSendMessage();
    const { simulateUpload, cancelUpload, getProgress } = useFileUploadProgress();
    const [previewAttachments, setPreviewAttachments] = useState<Array<{ 
        id: string; 
        text: string; 
        _file: File;
    }>>([]);
    const isMinimized = state.appStates.isMinimized;
    
    // Create attachment preview items with progress for ChatInput
    const attachmentPreviewItems = useMemo(() => 
        previewAttachments.map(att => {
            const progressPercentage = getProgress(att.id);
            return {
                id: att.id,
                text: att.text,
                progress: progressPercentage !== undefined ? progressPercentage / 100 : undefined, // Normalize 0-100 to 0-1
                _file: att._file
            };
        })
    , [previewAttachments, getProgress]);

    // Handle file attachment selection (optimized)
    const handleFilesSelected = useCallback((files: File[]) => {
        if (!files?.length) return;

        // If Web Chat is configured to send attachment on select, send immediately
        // if ((styleOptions as any)?.sendAttachmentOn === "attach") {
        //     const webChatAttachments: SendBoxAttachment[] = files.map(file => ({ blob: file }));
        //     if (webChatAttachments.length) {
        //         // send with no text
        //         sendMessage(undefined, "keyboard", { attachments: webChatAttachments });
        //     }
        //     return;
        // }

        const timestamp = Date.now();
        const newAttachments = files.map((file, index) => ({
            id: `${timestamp}-${index}`,
            text: file.name,
            _file: file
        }));
        
        setPreviewAttachments(prev => [...prev, ...newAttachments]);
        
        // Start upload progress simulation
        newAttachments.forEach(attachment => simulateUpload(attachment.id));
    }, [simulateUpload, sendMessage, styleOptions]);

    // Handle paste events (optimized)
    const handlePaste = useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file") {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            handleFilesSelected(files);
            event.preventDefault();
        }
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
    const handleSend = useCallback((message: string, attachments?: ReadonlyArray<{
        id: string;
        text?: string;
        progress?: number;
        _file?: File;
    }>) => {
        const attachmentsToSend = attachments?.length ? attachments : previewAttachments;
        const webChatAttachments: SendBoxAttachment[] = attachmentsToSend
            .filter((att): att is typeof att & { _file: File } => !!att._file)
            .map(att => ({ blob: att._file }));

        if (message.trim() || webChatAttachments.length > 0) {
            sendMessage(message.trim() || undefined, "keyboard", {
                ...(webChatAttachments.length > 0 && { attachments: webChatAttachments })
            });
            setPreviewAttachments([]);
        }
    }, [sendMessage, previewAttachments]);

    // Handle text change
    const handleTextChange = useCallback(() => {
        // Placeholder for future text change logic
    }, []);

    // Handle suggestion clicks
    const handleSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        console.log("Suggestion option clicked:", suggestion);
        try {
            const val = suggestion.value;
            const isCardActionObject = !!val && typeof val === "object" && "type" in (val as Record<string, unknown>);

            if (isCardActionObject) {
                // Forward the original Web Chat card action to Web Chat to let existing middlewares handle it
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
        console.log("webChatSuggestedActions:", webChatSuggestedActions);
        if (!webChatSuggestedActions?.length || !shouldShowSuggestions) return [];

        return webChatSuggestedActions.map((action: unknown) => {
            const actionObj = action as Record<string, unknown>;
            // Preserve original action in value to leverage Web Chat performCardAction + middlewares
            return {
                text: (actionObj.title || actionObj.text || actionObj.displayText || "Action") as string,
                // value: actionObj.value,
                value: actionObj,
                displayText: (actionObj.displayText || actionObj.title || actionObj.text) as string,
                type: (actionObj.type || "postBack") as string,
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

    console.log("ChatInputStateful props:", {
        controlProps,
        styleProps,
        componentOverrides: chatInputProps?.componentOverrides
    });

    console.log("Suggested actions props:", suggestedActionsProps);
    return (
        <ChatInput
            chatInputProps={{ controlProps, styleProps, componentOverrides: chatInputProps?.componentOverrides }}
            suggestionsProps={suggestedActionsProps}
        />
    );
};

export default ChatInputStateful;