import { useCallback, useEffect, useMemo, useState } from "react";
import { useFileUploadProgress } from "../../../hooks/useFileUploadProgress";
import { IChatPreviewAttachment } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputAttachmentProps";

export function useChatInputAttachments() {
    const { simulateUpload, cancelUpload, getProgress } = useFileUploadProgress();
    const [attachments, setAttachments] = useState<IChatPreviewAttachment[]>([]);

    // Extract pasted files
    const extractFilesFromClipboard = useCallback((event: ClipboardEvent): File[] => {
        const items = event.clipboardData?.items;
        if (!items) return [];
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === "file") {
                const f = items[i].getAsFile();
                if (f) files.push(f);
            }
        }
        return files;
    }, []);

    const addFiles = useCallback((files: File[]) => {
        if (!files?.length) return;
        const ts = Date.now();
        setAttachments(prev => {
            // Build set of existing file identity keys
            const existingKeys = new Set<string>(
                prev.reduce<string[]>((acc, p) => {
                    if (p.file) {
                        acc.push(`${p.file.name}_${p.file.size}_${p.file.lastModified}`);
                    }
                    return acc;
                }, [])
            );
            const newItems: IChatPreviewAttachment[] = [];
            files.forEach((file, i) => {
                const key = `${file.name}_${file.size}_${file.lastModified}`;
                if (existingKeys.has(key)) {
                    return; // skip duplicate
                }
                existingKeys.add(key);
                newItems.push({
                    id: `${ts}-${i}`,
                    file,
                    text: file.name
                });
            });
            // Start simulated uploads outside state mutation
            newItems.forEach(a => simulateUpload(a.id));
            return newItems.length ? [...prev, ...newItems] : prev;
        });
    }, [simulateUpload]);

    const removeAt = useCallback((index: number) => {
        setAttachments(prev => {
            const target = prev[index];
            if (target) {
                cancelUpload(target.id);
            }
            return prev.filter((_, i) => i !== index);
        });
    }, [cancelUpload]);

    const clearAttachments = useCallback(() => {
        setAttachments([]);
    }, []);


    // Paste handler: adds files & prevents default when files exist
    const onPaste = useCallback((event: ClipboardEvent) => {
        const files = extractFilesFromClipboard(event);
        if (files.length) {
            addFiles(files);
            event.preventDefault();
        }
    }, [extractFilesFromClipboard, addFiles]);

    const previewAttachments: ReadonlyArray<IChatPreviewAttachment> = useMemo(() => attachments.map(att => ({
        id: att.id,
        text: att.text || att.file?.name,
        progress: (() => { const p = getProgress(att.id); return p !== undefined ? p / 100 : undefined; })(),
        file: att.file
    })), [attachments, getProgress]);

    // Cleanup any in-progress simulations on unmount
    useEffect(() => {
        return () => {
            attachments.forEach(a => cancelUpload(a.id));
        };
    }, [attachments, cancelUpload]);

    return {
        attachments,
        previewAttachments,
        addFiles,
        removeAt,
        clearAttachments,
        onPaste
    };
}
