import DOMPurify from "dompurify";

/**
 * Detects potential Cross-Site Scripting (XSS) attacks in text input and sanitizes the content.
 * 
 * This function performs comprehensive XSS detection using pattern matching for common attack vectors
 * and then sanitizes the input using DOMPurify with strict configuration. It's designed to protect
 * against various XSS techniques including script injection, event handler injection, style-based
 * attacks, and encoded payloads.
 * 
 * Security patterns detected:
 * - JavaScript protocol URLs (javascript:)
 * - HTML event handlers (onmouseover, onclick, etc.)
 * - Script tags (<script>)
 * - CSS expression() functions
 * - CSS url() functions
 * - Position-based CSS attacks (position: fixed/absolute)
 * - VBScript protocol URLs
 * - Data URLs with HTML content
 * - Fragment identifiers with escaped quotes
 * - HTML entity-encoded angle brackets
 * 
 * @param text - The input text to be analyzed and sanitized
 * @returns An object containing:
 *   - cleanText: The sanitized version of the input text with all HTML tags and attributes removed
 *   - isXSSDetected: Boolean flag indicating whether potential XSS patterns were found in the original text
 */
export const detectAndCleanXSS = (text: string): { cleanText: string; isXSSDetected: boolean } => {
    // Comprehensive array of regular expressions to detect common XSS attack patterns
    const xssPatterns = [
        /javascript\s*:/gi,                                // JavaScript protocol URLs (with optional spaces)
        /vbscript\s*:/gi,                                  // VBScript protocol URLs (with optional spaces)
        /on\w+\s*=/gi,                                     // HTML event handlers (onmouseover, onclick, onload, etc.)
        /<\s*script/gi,                                    // Script tag opening (with optional spaces)
        /expression\s*\(/gi,                               // CSS expression() function (IE-specific)
        /url\s*\(/gi,                                      // CSS url() function
        /style\s*=.*position\s*:\s*fixed/gi,              // CSS position fixed attacks
        /style\s*=.*position\s*:\s*absolute/gi,           // CSS position absolute attacks
        /data\s*:\s*text\s*\/\s*html/gi,                  // Data URLs containing HTML
        /#.*\\"/gi,                                        // Fragment identifiers with escaped quotes
        /&gt;.*&lt;/gi,                                    // HTML entity-encoded angle brackets indicating tag structure
    ];
    
    // Check if any XSS patterns are detected in the input text
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