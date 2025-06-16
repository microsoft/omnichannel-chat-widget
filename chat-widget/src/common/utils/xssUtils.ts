import DOMPurify from "dompurify";

export const detectAndCleanXSS = (text: string): { cleanText: string; isXSSDetected: boolean } => {
    
    
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

// URL detection patterns
const urlPatterns = [
    // HTTP/HTTPS URLs
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    // www. URLs without protocol
    /www\.[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,
    // Domain without www
    /(?<![@\w])[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(com|org|net|edu|gov|mil|int|co|uk|ca|de|fr|au|jp|cn|in|br|mx|ru)\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi
];

const phonePattern = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;

export const convertUrlsToSafeLinks = (text: string): string => {
    let processedText = text;
    
    // First, detect and convert URLs
    urlPatterns.forEach(pattern => {
        processedText = processedText.replace(pattern, (match) => {
            // Ensure the URL has a protocol
            let url = match;
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            
            // Validate the URL is safe (basic check)
            try {
                const urlObj = new URL(url);
                // Only allow http and https protocols
                if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`;
                }
            } catch (e) {
                // Invalid URL, return as text
                return match;
            }
            
            return match;
        });
    });
    
    // Convert phone numbers to clickable links
    processedText = processedText.replace(phonePattern, (match) => {
        const cleanPhone = match.replace(/\D/g, ""); // Remove non-digits
        if (cleanPhone.length >= 10) {
            return `<a href="tel:${cleanPhone}">${match}</a>`;
        }
        return match;
    });
    
    return processedText;
};

export const processTextWithSafeLinks = (text: string): { processedText: string; isXSSDetected: boolean } => {
    // First clean XSS
    const { cleanText, isXSSDetected } = detectAndCleanXSS(text);
    
    // Then convert URLs to safe links
    const textWithLinks = convertUrlsToSafeLinks(cleanText);
    
    // Final sanitization allowing only safe HTML
    const finalText = DOMPurify.sanitize(textWithLinks, {
        ALLOWED_TAGS: ["a"],
        ALLOWED_ATTR: ["href", "target", "rel"],
        RETURN_TRUSTED_TYPE: false
    });
    
    return { processedText: finalText, isXSSDetected };
};
