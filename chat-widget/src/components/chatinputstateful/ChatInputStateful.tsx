import React, { Dispatch, useCallback, useEffect, useMemo, useState } from "react";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { createTimer } from "../../common/utils";
import { ITimer } from "../../common/interfaces/ITimer";
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
import { DragDropZone } from "./components/DragDropZone";
import { ISuggestionItem } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionsProps";
import { IChatInputProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputProps";

const { useSuggestedActions, usePerformCardAction, useActivities } = WebChatHooks;

let uiTimer: ITimer;

export const ChatInputStateful = (props: IChatInputProps) => {
    const [webChatSuggestedActions] = useSuggestedActions();
    const performCardAction = usePerformCardAction();
    const [activities] = useActivities();
    const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
    const [lastActivityId, setLastActivityId] = useState<string | null>(null);
    
    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXFooterStart
        });
    }, []);

    const [state]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const sendMessage = WebChatHooks.useSendMessage();
    const { simulateUpload, cancelUpload, getProgress } = useFileUploadProgress();
    
    // Extract state variables
    const isMinimized = state.appStates.isMinimized;
    
    const [previewAttachments, setPreviewAttachments] = useState<Array<{ 
        id: string; 
        text: string; 
        _file: File;
    }>>([]);

    // Create attachment preview items with progress for ChatInput
    const attachmentPreviewItems = useMemo(() => 
        previewAttachments.map(att => ({
            id: att.id,
            text: att.text,
            progress: getProgress(att.id), // get the progress if exists
            _file: att._file // Include file object for sending
        }))
    , [previewAttachments, getProgress]);

    // Handle file attachment selection (optimized)
    const handleFilesSelected = useCallback((files: File[]) => {
        if (!files?.length) return;

        const timestamp = Date.now();
        const newAttachments = files.map((file, index) => ({
            id: `${timestamp}-${index}`,
            text: file.name,
            _file: file
        }));
        
        setPreviewAttachments(prev => [...prev, ...newAttachments]);
        
        // Start upload progress simulation
        newAttachments.forEach(attachment => simulateUpload(attachment.id));
    }, [simulateUpload]);

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
        const customControlProps = props?.controlProps;

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
        props?.controlProps
    ]);

    // Build style props
    const styleProps = useMemo(() => ({
        ...getDefaultStyleProps(),
        ...props?.styleProps,
    }), [props?.styleProps]);

    // Convert WebChat actions to suggestions format
    const convertedSuggestions = useMemo(() => {
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

    useEffect(() => {
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXFooterCompleted,
            ElapsedTimeInMilliseconds: uiTimer.milliSecondsElapsed
        });
    }, []);

    return (
        <DragDropZone
            onFilesDropped={handleFilesSelected}
            accept="*/*"
            maxFiles={5}
        >
            <ChatInput
                controlProps={controlProps}
                styleProps={styleProps}
                componentOverrides={props?.componentOverrides}
                suggestionsProps={{
                    controlProps: {
                        onSuggestionClick: handleSuggestionClick,
                        suggestions: convertedSuggestions
                    }
                }}
            />
        </DragDropZone>
    );
};

export default ChatInputStateful;