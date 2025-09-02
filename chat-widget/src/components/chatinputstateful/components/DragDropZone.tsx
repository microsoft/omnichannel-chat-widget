import React, { useCallback, useState, DragEvent } from "react";

interface IDragDropZoneProps {
    onFilesDropped: (files: File[]) => void;
    children: React.ReactNode;
    accept?: string;
    maxFiles?: number;
}

export const DragDropZone: React.FC<IDragDropZoneProps> = ({
    onFilesDropped,
    children,
    accept,
    maxFiles = 10
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if the drag contains files
        const hasFiles = e.dataTransfer?.types.includes("Files") || 
                         Array.from(e.dataTransfer?.types || []).some(type => 
                             type.toLowerCase().includes("file")
                         );
        
        if (hasFiles) {
            console.log("Drag enter with files detected"); // Debug log
            setIsDragOver(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // Check if we're really leaving the drop zone (not just moving to a child element)
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // If cursor is outside the drop zone bounds, hide overlay
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

        console.log("Drop event triggered"); // Debug log
        const files = Array.from(e.dataTransfer.files);
        console.log("Files dropped:", files.length, files); // Debug log
        
        if (files.length === 0) return;

        // Filter files by accept type if specified
        let filteredFiles = files;
        if (accept && accept !== "*/*") {
            const acceptedTypes = accept.split(",").map(type => type.trim());
            console.log("Accept types:", acceptedTypes); // Debug log
            filteredFiles = files.filter(file => {
                return acceptedTypes.some(type => {
                    if (type.startsWith(".")) {
                        return file.name.toLowerCase().endsWith(type.toLowerCase());
                    }
                    if (type === "*/*") {
                        return true; // Accept all files
                    }
                    return file.type.includes(type.replace("*", ""));
                });
            });
            console.log("Filtered files:", filteredFiles.length, filteredFiles); // Debug log
        }

        // Limit number of files
        const limitedFiles = filteredFiles.slice(0, maxFiles);
        console.log("Final files to process:", limitedFiles.length, limitedFiles); // Debug log
        
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
        backgroundColor: "rgba(0, 123, 255, 0.1)",
        border: "2px dashed #007bff",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        color: "#007bff",
        fontWeight: "500",
        zIndex: 1000,
        pointerEvents: "none", // Important: prevents interference with drag events
        boxSizing: "border-box" // Ensures border doesn't overflow
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ 
                position: "relative",
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box"
            }}
        >
            {children}
            {isDragOver && (
                <div style={overlayStyle}>
                    Drop files here to attach
                </div>
            )}
        </div>
    );
};
