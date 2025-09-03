/**
 * Paste file utilities
 */

/**
 * Extract files from a paste event
 * @param event - The clipboard paste event
 * @returns Array of pasted files
 */
export const extractFilesFromPasteEvent = (event: ClipboardEvent): File[] => {
    const items = event.clipboardData?.items;
    if (!items) return [];

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
            const file = items[i].getAsFile();
            if (file) files.push(file);
        }
    }

    return files;
};

/**
 * Create a paste handler for ChatInput onPaste prop
 * @param onFiles - Callback when files are pasted
 * @returns Paste event handler function
 */
export const createPasteFileHandler = (onFiles: (files: File[]) => void) => {
    return (event: ClipboardEvent) => {
        const files = extractFilesFromPasteEvent(event);
        if (files.length > 0) {
            onFiles(files);
            // Prevent default paste behavior when files are found
            event.preventDefault();
        }
    };
};