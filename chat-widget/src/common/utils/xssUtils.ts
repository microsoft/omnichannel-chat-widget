import DOMPurify from "dompurify";

const xssPatterns = [
    /javascript:/gi,
    /on\w+\s*=/gi, // onmouseover, onclick, etc.
    /<script/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /style\s*=.*position\s*:\s*fixed/gi,
    /style\s*=.*position\s*:\s*absolute/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /#.*\\"/gi, // Fragment with escaped quotes
    /&gt;.*&lt;/gi, // Encoded angle brackets
];

export const detectAndCleanXSS = (text: string): { cleanText: string; isXSSDetected: boolean } => {
    
    // Check if any XSS patterns are detected
    const isXSSDetected = xssPatterns.some(pattern => pattern.test(text));
    
    // Clean the text using DOMPurify with strict config
    const cleanText = DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [], // No HTML tags allowed in title
        ALLOWED_ATTR: [],
        KEEP_CONTENT: true, // Keep text content
        ALLOW_DATA_ATTR: false,
        ALLOW_UNKNOWN_PROTOCOLS: false,
        SANITIZE_DOM: true,
        FORCE_BODY: false
    });
    
    return { cleanText, isXSSDetected };
};