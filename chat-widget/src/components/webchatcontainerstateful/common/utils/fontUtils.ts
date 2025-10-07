/**
 * Utility functions for font handling and emoji support
 */

/**
 * Creates a font family optimized for iOS emoji support
 * Uses system-ui as the primary font for better emoji rendering on iOS
 * @param primaryFont - The base font family string (optional, used as fallback)
 * @returns Font family string optimized for iOS emoji support
 */
export const createIOSOptimizedEmojiFont = (primaryFont?: string): string => {
    // For iOS emoji support, system-ui should be first
    const baseFont = "system-ui";
    const emojiSupport = "\"Apple Color Emoji\", \"Segoe UI Emoji\"";
    
    if (!primaryFont || primaryFont.includes("system-ui") || primaryFont.includes("Apple Color Emoji")) {
        return `${baseFont}, ${emojiSupport}`;
    }
    
    // Add configured font as fallback after emoji fonts
    return `${baseFont}, ${emojiSupport}, ${primaryFont}`;
};