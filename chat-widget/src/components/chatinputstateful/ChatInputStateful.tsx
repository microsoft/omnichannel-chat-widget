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
import { IChatInputStatefulParams } from "./interfaces/IChatInputStatefulParams";
import { useFileUploadProgress } from "../../hooks/useFileUploadProgress";
import { getDefaultControlProps } from "./common/defaultProps/defaultControlProps";
import { getDefaultStyleProps } from "./common/defaultProps/defaultStyleProps";
import { DragDropZone } from "./components/DragDropZone";

let uiTimer: ITimer;

export const ChatInputStateful = (props: IChatInputStatefulParams) => {
    const {
        chatInputProps,
        hideTextInput = false,
        isMinimized = false
    } = props;
    
    useEffect(() => {
        uiTimer = createTimer();
        TelemetryHelper.logLoadingEvent(LogLevel.INFO, {
            Event: TelemetryEvent.UXFooterStart // Using footer events as placeholder
        });
    }, []);

    const [state]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    const sendMessage = WebChatHooks.useSendMessage();
    const { simulateUpload, cancelUpload, getProgress } = useFileUploadProgress();
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
    if (isMinimized || hideTextInput || state.appStates.conversationState !== ConversationState.Active) {
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
        ...chatInputProps?.styleProps,
    }), [chatInputProps?.styleProps]);

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
                componentOverrides={chatInputProps?.componentOverrides}
            />
        </DragDropZone>
    );
};

export default ChatInputStateful;