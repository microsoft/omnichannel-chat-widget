import React from "react";

/**
 * ChatInput Style Props
 * Provides comprehensive styling options for all visual elements within the chat input,
 * including the container, input field, buttons, and attachment previews.
 * 
 * For granular styling of individual elements (send button, input field, etc.),
 * use componentOverrides instead of style props (following Fluent UI patterns).
 */
export interface IChatInputStyleProps {
    // === Container styles ===
    containerStyleProps?: React.CSSProperties; // Outer div container
    
    // === Input field styles ===
    inputContainerStyleProps?: React.CSSProperties; // root chat input div
    inputWrapperStyleProps?: React.CSSProperties; // wrapper around the input field
    inputFieldStyleProps?: React.CSSProperties; // actual input field

    // === Button styles ===
    sendButtonStyleProps?: React.CSSProperties;
    attachmentButtonStyleProps?: React.CSSProperties;
    
    // === Attachment preview styles ===
    attachmentContainerStyleProps?: React.CSSProperties;
    attachmentItemStyleProps?: React.CSSProperties;
}