import React from "react";
import { IChatInputStyleProps } from "../../interfaces/IChatInputStyleProps";

/**
 * Simple mapping of style properties to CSS selectors
 */
const STYLE_MAPPINGS: Record<string, string> = {
    inputWrapperStyleProps: ".fai-ChatInput__inputWrapper",
    inputFieldStyleProps: ".fai-EditorInput .fai-EditorInput__input", 
    sendButtonStyleProps: ".fai-SendButton .fai-SendButton__stopBackground",
    attachmentButtonStyleProps: ".fai-ChatInput__attachmentButton",
    attachmentContainerStyleProps: ".fai-ChatInput__attachments",
    attachmentItemStyleProps: ".fai-Attachment div"
};

/**
 * Creates dynamic CSS styles for ChatInput component
 * @param styleProps - Style properties from IChatInputStyleProps
 * @returns React style element or null
 */
export const renderDynamicStyles = (styleProps: IChatInputStyleProps): React.ReactElement | null => {
    const cssRules: string[] = [];
    
    // Generate CSS rules for each provided style property
    Object.entries(styleProps).forEach(([key, styles]) => {
        const selector = STYLE_MAPPINGS[key];
        if (!selector || !styles || typeof styles !== "object") return;

        // Convert React styles to CSS string with !important for better specificity
        const cssProps = Object.entries(styles as React.CSSProperties)
            .map(([prop, value]) => 
                value != null ? `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value} !important;` : ""
            )
            .filter(Boolean)
            .join(" ");

        if (cssProps) {
            const rule = `${selector} { ${cssProps} }`;
            cssRules.push(rule);
        }
    });

    return cssRules.length > 0 ? 
        React.createElement("style", { key: "chat-input-styles" }, cssRules.join("\n")) : 
        null;
};
