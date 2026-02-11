import DOMPurify from "dompurify";

/**
 * Sanitizes text input and detects XSS attack patterns.
 * 
 * Sanitizes first with DOMPurify, then checks for malicious patterns in both
 * the original and sanitized text to catch mutation XSS attacks.
 * 
 * @param text - Input text to sanitize
 * @returns Object with cleanText (sanitized) and isXSSDetected flag
 */
export const detectAndCleanXSS = (text: string): { cleanText: string; isXSSDetected: boolean } => {
    // Sanitize first to prevent mutation XSS (e.g., "s<iframe></iframe>tyle" → "style")
    const cleanText = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true,
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        FORCE_BODY: false
    });

    const contentChanged = text !== cleanText;

    // Non-global regex patterns to avoid stateful .test() issues
    const xssPatterns = [
        /javascript\s*:/i,
        /vbscript\s*:/i,
        /on\w+\s*=/i,                      // Event handlers
        /<\s*script/i,
        /<\s*iframe/i,
        /<\s*object/i,
        /<\s*embed/i,
        /<\s*svg/i,
        /expression\s*\(/i,                // IE CSS expressions
        /style\s*=.*position\s*:\s*(fixed|absolute)/i,
        /data\s*:\s*text\s*\/\s*html/i,
        /#.*\\"/i,
        /&(lt|gt|#x3c|#60|#x3e|#62);/i,   // HTML entities
        /&#x?[0-9a-f]+;.*</i,
        /\u003c.*\u003e/i,                 // Unicode escapes
        /src\s*=\s*["']?\s*javascript:/i,
        /href\s*=\s*["']?\s*javascript:/i
    ];

    const hasXSSPattern = xssPatterns.some(pattern => {
        return pattern.test(text) || pattern.test(cleanText);
    });

    const hasHTMLStructure = /<[^>]+>/.test(text) && !/<[^>]+>/.test(cleanText);

    const isXSSDetected = contentChanged || hasXSSPattern || hasHTMLStructure;

    return { cleanText, isXSSDetected };
};