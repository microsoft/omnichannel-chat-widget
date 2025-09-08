import { IChatInputStyleProps } from "../../interfaces/IChatInputStyleProps";

/**
 * Generates CSS rules for the attachment (upload) button based on a subset of Web Chat style options.
 */
export function createChatInputUploadButtonStyles(styleProps: IChatInputStyleProps): string {
    const {
        sendBoxButtonColor,
        sendBoxButtonColorOnHover,
        sendBoxButtonColorOnFocus,
        sendBoxButtonColorOnDisabled
    } = styleProps;

    // If none provided, skip.
    if (!sendBoxButtonColor && !sendBoxButtonColorOnHover && !sendBoxButtonColorOnFocus && !sendBoxButtonColorOnDisabled) {
        return "";
    }

    let css = "";
    const baseSelector = ".fai-ChatInput__attachmentButton";

    // Base icon color (applies to button and svg via currentColor).
    if (sendBoxButtonColor) {
        css += `${baseSelector} { color: ${sendBoxButtonColor} !important; }\n`;
        css += `${baseSelector} .fui-Button__icon svg { fill: ${sendBoxButtonColor} !important; }\n`;
    }

    // Disabled state
    if (sendBoxButtonColorOnDisabled) {
        css += `${baseSelector}:disabled, ${baseSelector}[aria-disabled="true"] { color: ${sendBoxButtonColorOnDisabled} !important; }\n`;
        css += `${baseSelector}:disabled .fui-Button__icon svg, ${baseSelector}[aria-disabled="true"] .fui-Button__icon svg { fill: ${sendBoxButtonColorOnDisabled} !important; }\n`;
    }

    // Hover (only when interactive)
    if (sendBoxButtonColorOnHover) {
        css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):hover { color: ${sendBoxButtonColorOnHover} !important; }\n`;
        css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):hover .fui-Button__icon svg { fill: ${sendBoxButtonColorOnHover} !important; }\n`;
    }

    // Focus (non-hover, non-active) – matches pattern used elsewhere
    if (sendBoxButtonColorOnFocus) {
        css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):not(:hover):focus { color: ${sendBoxButtonColorOnFocus} !important; }\n`;
        css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):not(:hover):focus .fui-Button__icon svg { fill: ${sendBoxButtonColorOnFocus} !important; }\n`;
    }

    return css.trim();
}
