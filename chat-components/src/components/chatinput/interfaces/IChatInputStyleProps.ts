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
    // === Custom root container styles ===
    containerStyleProps?: React.CSSProperties; // Outer div container
    
    // === Input field styles ===
    inputContainerStyleProps?: React.CSSProperties; // root chat input div
    inputWrapperStyleProps?: React.CSSProperties; // wrapper around the input field
    inputFieldStyleProps?: React.CSSProperties; // actual input field

    // === Attachment preview styles ===
    attachmentContainerStyleProps?: React.CSSProperties;
    attachmentItemStyleProps?: React.CSSProperties;

    // === Drag & Drop Overlay customization ===
    dragDropOverlayStyleProps?: React.CSSProperties;

    // === Web Chat compatibility layer ===
    // Legacy style mappings to maintain backward compatibility with existing Web Chat implementations
    // === Send button styles ===
    sendBoxButtonColor?: string;
    sendBoxButtonColorOnActive?: string;
    sendBoxButtonColorOnDisabled?: string;
    sendBoxButtonColorOnFocus?: string;
    sendBoxButtonColorOnHover?: string;
    sendBoxButtonShadeColor?: string;
    sendBoxButtonShadeColorOnActive?: string;
    sendBoxButtonShadeColorOnDisabled?: string;
    sendBoxButtonShadeColorOnFocus?: string;
    sendBoxButtonShadeColorOnHover?: string;
    sendBoxButtonShadeBorderRadius?: string | number;
    sendBoxButtonShadeInset?: string | number;
    sendBoxButtonKeyboardFocusIndicatorBorderColor?: string;
    sendBoxButtonKeyboardFocusIndicatorBorderRadius?: string | number;
    sendBoxButtonKeyboardFocusIndicatorBorderStyle?: string;
    sendBoxButtonKeyboardFocusIndicatorBorderWidth?: string | number;
    sendBoxButtonKeyboardFocusIndicatorInset?: string | number;

    // === Send box (container) styles ===
    sendBoxBackground?: string; // Background color of the main send box area
    sendBoxBorderTop?: string | number; // Individual borders allow asymmetric styling
    sendBoxBorderRight?: string | number;
    sendBoxBorderBottom?: string | number;
    sendBoxBorderLeft?: string | number;
    sendBoxHeight?: string | number; // Minimum height of the overall send box

    // ===  Send box text box styles ===
    sendBoxMaxHeight?: string | number; // Maximum height for text box growth
    sendBoxTextColor?: string; // Standard text color
    sendBoxDisabledTextColor?: string; // Disabled text color
    sendBoxPlaceholderColor?: string; // Placeholder text color
}