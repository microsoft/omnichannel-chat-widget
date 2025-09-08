import React, { useCallback, useState, DragEvent } from "react";

interface IDragDropZoneProps {
    onFilesDropped: (files: File[]) => void;
    children: React.ReactNode;
    accept?: string;
    maxFiles?: number;
    overlayStyleProps?: React.CSSProperties; // merged with defaults (container + text)
    overlayText?: string; // custom text
}

// Internal drag-and-drop zone that only wraps the ChatInput area (not Suggestions)
export const DragDropZone: React.FC<IDragDropZoneProps> = ({
    onFilesDropped,
    children,
    accept,
    maxFiles = 10,
    overlayStyleProps,
    overlayText
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const types = e.dataTransfer?.types || [];
        const hasFiles = (types as unknown as string[]).includes("Files") ||
            Array.from(types as unknown as string[]).some(type => type?.toLowerCase?.().includes("file"));

        if (hasFiles) {
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const { clientX: x, clientY: y } = e;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        // Filter by accept
        let filteredFiles = files;
        if (accept && accept !== "*/*") {
            const acceptedTypes = accept.split(",").map(type => type.trim());
            filteredFiles = files.filter(file => {
                return acceptedTypes.some(type => {
                    if (type.startsWith(".")) {
                        return file.name.toLowerCase().endsWith(type.toLowerCase());
                    }
                    if (type === "*/*") {
                        return true;
                    }
                    return file.type.includes(type.replace(/\*/g, ""));
                });
            });
        }

        const limitedFiles = filteredFiles.slice(0, maxFiles);
        if (limitedFiles.length > 0) {
            onFilesDropped(limitedFiles);
        }
    }, [onFilesDropped, accept, maxFiles]);

    const overlayStyle: React.CSSProperties = {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        pointerEvents: "none",
        boxSizing: "border-box",
        ...(overlayStyleProps || {})
    };

    return (
        <div
            id="lcw-chat-input-drag-drop-zone"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{
                position: "relative",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                backgroundColor: "#F7F7F9",
                padding: 0
            }}
        >
            {children}
            {isDragOver && (
                <div style={overlayStyle}>
                    <span>{overlayText}</span>
                </div>
            )}
        </div>
    );
};

export default DragDropZone;
