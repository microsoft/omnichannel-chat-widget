import React from "react";
import { IChatInputStyleProps } from "../../interfaces/IChatInputStyleProps";
import { createChatInputSendButtonStyle } from "./sendButtonStyles";
import { createChatInputSendBoxStyles } from "./sendBoxStyles";
import { createChatInputUploadButtonStyles } from "./uploadButtonStyles";

/**
 * StyleUtils for ChatInput Component
 * This module provides comprehensive styling utilities for the ChatInput component
 */

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
    
    // Generate comprehensive send button styles first
    const sendButtonStyles = createChatInputSendButtonStyle(styleProps);
    if (sendButtonStyles) {
        cssRules.push(sendButtonStyles);
    }

    // Generate send box (container + text box) styles next (WebChat parity)
    const sendBoxStyles = createChatInputSendBoxStyles(styleProps);
    if (sendBoxStyles) {
        cssRules.push(sendBoxStyles);
    }


    // Generate upload/attachment button styles (reusing sendBoxButton* color props)
    const uploadButtonStyles = createChatInputUploadButtonStyles(styleProps);
    if (uploadButtonStyles) {
        cssRules.push(uploadButtonStyles);
    }
    
    // Generate CSS rules for other style properties
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

    const additionalRules = [
        // Update styles for the ::before pseudo-element
        `.fai-ChatInput::before { border-radius: ${styleProps.inputContainerStyleProps?.borderRadius} !important; opacity: 0 !important; }`,
    ];
    cssRules.push(...additionalRules);

    return cssRules.length > 0 ? 
        React.createElement("style", { key: "chat-input-styles" }, cssRules.join("\n")) : 
        null;
};
