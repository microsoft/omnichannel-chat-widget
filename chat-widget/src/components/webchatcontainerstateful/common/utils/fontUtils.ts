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

/**
 * Enhances a font family string with emoji font support for cross-platform compatibility
 * @param primaryFont - The base font family string
 * @returns Font family string with emoji fonts appended
 */
export const enhanceFontWithEmojis = (primaryFont?: string): string => {
    if (!primaryFont) {
        return "system-ui, \"Apple Color Emoji\", \"Segoe UI Emoji\"";
    }

    // If already includes emoji fonts, return as-is
    if (primaryFont.includes("Apple Color Emoji")) {
        return primaryFont;
    }

    // For better iOS emoji support, ensure system-ui is included
    const baseFont = primaryFont.includes("system-ui") 
        ? primaryFont 
        : `system-ui, ${primaryFont}`;

    // Add emoji font support
    return `${baseFont}, "Apple Color Emoji", "Segoe UI Emoji"`;
};

/**
 * Creates a font family with comprehensive emoji support for all platforms
 * @param primaryFont - The base font family string
 * @returns Font family string with full emoji support (iOS, Android, Windows)
 */
export const createCrossPlatformEmojiFont = (primaryFont?: string): string => {
    if (!primaryFont) {
        return "system-ui, \"Apple Color Emoji\", \"Noto Color Emoji\", \"Segoe UI Emoji\"";
    }

    // If already includes emoji fonts, return as-is
    if (primaryFont.includes("Apple Color Emoji")) {
        return primaryFont;
    }

    // For better iOS emoji support, ensure system-ui is included
    const baseFont = primaryFont.includes("system-ui") 
        ? primaryFont 
        : `system-ui, ${primaryFont}`;

    // Add comprehensive emoji font support for all platforms
    return `${baseFont}, "Apple Color Emoji", "Noto Color Emoji", "Segoe UI Emoji"`;
};