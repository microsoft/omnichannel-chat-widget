import { IChatInputStyleProps } from "../../interfaces/IChatInputStyleProps";

// helper to keep CSS string-building terse and consistent
const toPx = (value?: string | number): string | undefined =>
    value === undefined ? undefined : typeof value === "number" ? `${value}px` : String(value);

const ruleWithFillAndShade = (
    selector: string,
    backgroundColor?: string,
    shade?: string,
    insetPx?: string,
    extra?: string
): string => {
    if (!backgroundColor && !shade && !extra) return "";
    let r = `${selector} {`;
    if (backgroundColor) r += ` background-color: ${backgroundColor} !important;`;
    
    // insetPx as ring thickness now (previously was x/y offset creating a bevel on top/left).
    if (shade) {
        if (insetPx && insetPx !== "0px") {
            r += ` box-shadow: inset 0 0 0 ${insetPx} ${shade} !important;`;
        } else {
            // No thickness specified -> fallback to a subtle 1px ring
            r += ` box-shadow: inset 0 0 0 1px ${shade} !important;`;
        }
    }
    if (extra) r += ` ${extra}`;
    r += " }\n";
    return r;
};

export const createChatInputSendButtonStyle = (styleProps: IChatInputStyleProps): string => {
    const {
        sendBoxButtonColor,
        sendBoxButtonColorOnActive,
        sendBoxButtonColorOnDisabled,
        sendBoxButtonColorOnFocus,
        sendBoxButtonColorOnHover,
        sendBoxButtonShadeColor,
        sendBoxButtonShadeColorOnActive,
        sendBoxButtonShadeColorOnDisabled,
        sendBoxButtonShadeColorOnFocus,
        sendBoxButtonShadeColorOnHover,
        sendBoxButtonShadeBorderRadius,
        sendBoxButtonShadeInset,
        sendBoxButtonKeyboardFocusIndicatorBorderColor,
        sendBoxButtonKeyboardFocusIndicatorBorderRadius,
        sendBoxButtonKeyboardFocusIndicatorBorderStyle,
        sendBoxButtonKeyboardFocusIndicatorBorderWidth,
        sendBoxButtonKeyboardFocusIndicatorInset
    } = styleProps;

    const inset = toPx(sendBoxButtonShadeInset) ?? "0px";
    let css = "";

    // Base
    // Border radius behavior:
    // - If caller supplies sendBoxButtonShadeBorderRadius, use that exact value.
    // - Otherwise inherit the outer button's radius so circular buttons don't show a squared inner background.
    const baseExtra = sendBoxButtonShadeBorderRadius !== undefined
        ? ` border-radius: ${toPx(sendBoxButtonShadeBorderRadius)} !important;`
        : " border-radius: inherit !important;";
    css += ruleWithFillAndShade(
        ".fai-SendButton .fai-SendButton__stopBackground",
        sendBoxButtonColor,
        sendBoxButtonShadeColor,
        inset,
        baseExtra
    );

    // Disabled > Active > Hover > Focus (same priority model as Web Chat)
    css += ruleWithFillAndShade(
        ".fai-SendButton:disabled .fai-SendButton__stopBackground, .fai-SendButton[aria-disabled=\"true\"] .fai-SendButton__stopBackground",
        sendBoxButtonColorOnDisabled,
        sendBoxButtonShadeColorOnDisabled,
        inset
    );

    css += ruleWithFillAndShade(
        ".fai-SendButton:not(:disabled):not([aria-disabled=\"true\"]):active .fai-SendButton__stopBackground",
        sendBoxButtonColorOnActive,
        sendBoxButtonShadeColorOnActive,
        inset
    );

    css += ruleWithFillAndShade(
        ".fai-SendButton:not(:disabled):not([aria-disabled=\"true\"]):not(:active):hover .fai-SendButton__stopBackground",
        sendBoxButtonColorOnHover,
        sendBoxButtonShadeColorOnHover,
        inset
    );

    css += ruleWithFillAndShade(
        ".fai-SendButton:not(:disabled):not([aria-disabled=\"true\"]):not(:active):not(:hover):focus .fai-SendButton__stopBackground",
        sendBoxButtonColorOnFocus,
        sendBoxButtonShadeColorOnFocus,
        inset
    );

    // Keyboard focus indicator
    if (
        sendBoxButtonKeyboardFocusIndicatorBorderColor ||
    sendBoxButtonKeyboardFocusIndicatorBorderRadius ||
    sendBoxButtonKeyboardFocusIndicatorBorderStyle ||
    sendBoxButtonKeyboardFocusIndicatorBorderWidth ||
    sendBoxButtonKeyboardFocusIndicatorInset
    ) {
        const color = sendBoxButtonKeyboardFocusIndicatorBorderColor ?? "currentColor";
        const style = sendBoxButtonKeyboardFocusIndicatorBorderStyle ?? "solid";
        const width = toPx(sendBoxButtonKeyboardFocusIndicatorBorderWidth) ?? "2px";
        let extra = ` outline: ${width} ${style} ${color} !important;`;
        if (sendBoxButtonKeyboardFocusIndicatorBorderRadius) {
            extra += ` border-radius: ${toPx(sendBoxButtonKeyboardFocusIndicatorBorderRadius)} !important;`;
        }
        if (sendBoxButtonKeyboardFocusIndicatorInset) {
            extra += ` outline-offset: ${toPx(sendBoxButtonKeyboardFocusIndicatorInset)} !important;`;
        }
       
        css += ruleWithFillAndShade(
            ".fai-SendButton:focus-visible .fai-SendButton__stopBackground, .fai-SendButton:not(:active):not(:hover):focus .fai-SendButton__stopBackground",
            undefined,
            undefined,
            inset,
            extra
        );

        css += ".fai-SendButton[data-fui-focus-visible], .fai-SendButton:focus-visible { outline: none !important; box-shadow: none !important; }\n";
        css += ".fai-SendButton:focus { outline: none !important; }\n";
    }

    return css.trim();
};
