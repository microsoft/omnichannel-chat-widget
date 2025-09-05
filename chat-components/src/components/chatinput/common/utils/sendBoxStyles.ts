import { IChatInputStyleProps } from "../../interfaces/IChatInputStyleProps";

// Helper convert to px when numeric
const toPx = (v?: string | number): string | undefined =>
    v === undefined ? undefined : typeof v === "number" ? `${v}px` : String(v);

/**
 * Generates CSS rules for send box container + text box (input) based on a subset of Web Chat style options.
 */
export function createChatInputSendBoxStyles(styleProps: IChatInputStyleProps): string {
    const {
        sendBoxBackground,
        sendBoxBorderTop,
        sendBoxBorderRight,
        sendBoxBorderBottom,
        sendBoxBorderLeft,
        sendBoxHeight,
        sendBoxMaxHeight,
        sendBoxTextColor,
        sendBoxDisabledTextColor,
        sendBoxPlaceholderColor
    } = styleProps;

    let css = "";
    console.log("Creating chat input send box styles", styleProps);
    // Apply border + min-height + background to root; apply background also to inner wrapper for parity (prevents gaps/padding bleed).
    if (
        sendBoxBackground ||
        sendBoxBorderTop !== undefined ||
        sendBoxBorderRight !== undefined ||
        sendBoxBorderBottom !== undefined ||
        sendBoxBorderLeft !== undefined ||
        sendBoxHeight !== undefined
    ) {
        const borderTop = typeof sendBoxBorderTop === "number" ? `${sendBoxBorderTop}px solid` : sendBoxBorderTop;
        const borderRight = typeof sendBoxBorderRight === "number" ? `${sendBoxBorderRight}px solid` : sendBoxBorderRight;
        const borderBottom = typeof sendBoxBorderBottom === "number" ? `${sendBoxBorderBottom}px solid` : sendBoxBorderBottom;
        const borderLeft = typeof sendBoxBorderLeft === "number" ? `${sendBoxBorderLeft}px solid` : sendBoxBorderLeft;
        const minHeight = toPx(sendBoxHeight);
        css += ".fai-ChatInput {";
        if (sendBoxBackground) css += ` background-color: ${sendBoxBackground} !important;`;
        if (borderTop) css += ` border-top: ${borderTop} !important;`;
        if (borderRight) css += ` border-right: ${borderRight} !important;`;
        if (borderBottom) css += ` border-bottom: ${borderBottom} !important;`;
        if (borderLeft) css += ` border-left: ${borderLeft} !important;`;
        if (minHeight) css += ` min-height: ${minHeight} !important;`;
        css += ` }
    `;

        // Background also on wrapper for inner padding areas (does not reapply borders)
        if (sendBoxBackground) {
            css += `.fai-ChatInput__inputWrapper { background-color: ${sendBoxBackground} !important; }\n`;
        }
    }

    // Input (editor) text color, placeholder, disabled. Fluent editor input element.
    if (sendBoxTextColor || sendBoxDisabledTextColor || sendBoxPlaceholderColor || sendBoxMaxHeight) {
        const maxH = toPx(sendBoxMaxHeight);
        // Normal text color when enabled
        if (sendBoxTextColor) {
            css += `.fai-EditorInput .fai-EditorInput__input:not(:disabled):not([aria-disabled="true"]) { color: ${sendBoxTextColor} !important; }\n`;
        }
        // Disabled text
        if (sendBoxDisabledTextColor) {
            css += `.fai-EditorInput .fai-EditorInput__input:disabled, .fai-EditorInput .fai-EditorInput__input[aria-disabled="true"], .fai-EditorInput .fai-EditorInput__input[contenteditable="false"] { color: ${sendBoxDisabledTextColor} !important; }\n`;
        }
        // Placeholder: Copilot editor uses both a placeholder span and may fallback to native ::placeholder in some modes.
        if (sendBoxPlaceholderColor) {
            css += `.fai-EditorInput .fai-EditorInput__input::placeholder { color: ${sendBoxPlaceholderColor} !important; }\n`;
            css += `.fai-EditorInput__placeholderValue { color: ${sendBoxPlaceholderColor} !important; }\n`;
        }
        // Max height (caps growth of the textarea/contenteditable region). We attempt to apply to input wrapper as well.
        if (maxH) {
            css += `.fai-EditorInput, .fai-EditorInput .fai-EditorInput__input { max-height: ${maxH} !important; }\n`;
        }
    }

    return css.trim();
}
