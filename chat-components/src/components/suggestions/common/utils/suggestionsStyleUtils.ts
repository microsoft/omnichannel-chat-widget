import { ISuggestionsStyleProps } from "../../interfaces/ISuggestionsStyleProps";

/**
 * Dynamic CSS generator for Suggested Actions
 * Additionally supports container-level styling via .fai-SuggestionList.
 */

const toPx = (v?: string | number): string | undefined =>
    v === undefined ? undefined : typeof v === "number" ? `${v}px` : String(v);

export function createSuggestionsStyles(styleProps?: ISuggestionsStyleProps): string | null {
    if (!styleProps) return null;
    const {
        suggestedActionBackgroundColor,
        suggestedActionBorderColor,
        suggestedActionBorderStyle,
        suggestedActionBorderWidth,
        suggestedActionTextColor,
        suggestedActionBorderRadius,
        suggestedActionHeight,
        suggestedActionImageHeight, // Image height currently not applied (no image slot mapping in our Suggestions wrapper)
        suggestedActionBackgroundColorOnActive,
        suggestedActionBorderColorOnActive,
        suggestedActionBorderStyleOnActive,
        suggestedActionBorderWidthOnActive,
        suggestedActionTextColorOnActive,
        suggestedActionBackgroundColorOnDisabled,
        suggestedActionBorderColorOnDisabled,
        suggestedActionBorderStyleOnDisabled,
        suggestedActionBorderWidthOnDisabled,
        suggestedActionTextColorOnDisabled,
        suggestedActionBackgroundColorOnFocus,
        suggestedActionBorderColorOnFocus,
        suggestedActionBorderStyleOnFocus,
        suggestedActionBorderWidthOnFocus,
        suggestedActionTextColorOnFocus,
        suggestedActionBackgroundColorOnHover,
        suggestedActionBorderColorOnHover,
        suggestedActionBorderStyleOnHover,
        suggestedActionBorderWidthOnHover,
        suggestedActionTextColorOnHover,
        suggestedActionKeyboardFocusIndicatorBorderColor,
        suggestedActionKeyboardFocusIndicatorBorderRadius,
        suggestedActionKeyboardFocusIndicatorBorderStyle,
        suggestedActionKeyboardFocusIndicatorBorderWidth,
        suggestedActionKeyboardFocusIndicatorInset
    } = styleProps;

    let css = "";
    const baseSelector = ".fai-Suggestion";
    const baseRules: string[] = [];
    if (suggestedActionBackgroundColor) baseRules.push(`background-color: ${suggestedActionBackgroundColor} !important;`);
    if (suggestedActionBorderColor) baseRules.push(`border-color: ${suggestedActionBorderColor} !important;`);
    if (suggestedActionBorderStyle) baseRules.push(`border-style: ${suggestedActionBorderStyle} !important;`);
    if (suggestedActionBorderWidth !== undefined) baseRules.push(`border-width: ${toPx(suggestedActionBorderWidth)} !important;`);
    if (suggestedActionTextColor) baseRules.push(`color: ${suggestedActionTextColor} !important;`);
    if (suggestedActionBorderRadius !== undefined) baseRules.push(`border-radius: ${toPx(suggestedActionBorderRadius)} !important;`);
    if (suggestedActionHeight !== undefined) baseRules.push(`height: ${toPx(suggestedActionHeight)} !important;`);
    if (baseRules.length) css += `${baseSelector} { ${baseRules.join(" ")} }\n`;

    // 3. Disabled styles
    const disabledRules: string[] = [];
    if (suggestedActionBackgroundColorOnDisabled) disabledRules.push(`background-color: ${suggestedActionBackgroundColorOnDisabled} !important;`);
    if (suggestedActionBorderColorOnDisabled) disabledRules.push(`border-color: ${suggestedActionBorderColorOnDisabled} !important;`);
    if (suggestedActionBorderStyleOnDisabled) disabledRules.push(`border-style: ${suggestedActionBorderStyleOnDisabled} !important;`);
    if (suggestedActionBorderWidthOnDisabled !== undefined) disabledRules.push(`border-width: ${toPx(suggestedActionBorderWidthOnDisabled)} !important;`);
    if (suggestedActionTextColorOnDisabled) disabledRules.push(`color: ${suggestedActionTextColorOnDisabled} !important;`);
    if (disabledRules.length) css += `${baseSelector}:disabled, ${baseSelector}[aria-disabled="true"] { ${disabledRules.join(" ")} }\n`;

    // 4. Active (pressed) styles
    const activeRules: string[] = [];
    if (suggestedActionBackgroundColorOnActive) activeRules.push(`background-color: ${suggestedActionBackgroundColorOnActive} !important;`);
    if (suggestedActionBorderColorOnActive) activeRules.push(`border-color: ${suggestedActionBorderColorOnActive} !important;`);
    if (suggestedActionBorderStyleOnActive) activeRules.push(`border-style: ${suggestedActionBorderStyleOnActive} !important;`);
    if (suggestedActionBorderWidthOnActive !== undefined) activeRules.push(`border-width: ${toPx(suggestedActionBorderWidthOnActive)} !important;`);
    if (suggestedActionTextColorOnActive) activeRules.push(`color: ${suggestedActionTextColorOnActive} !important;`);
    if (activeRules.length) css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):active { ${activeRules.join(" ")} }\n`;

    // 5. Hover styles (when not active/disabled)
    const hoverRules: string[] = [];
    if (suggestedActionBackgroundColorOnHover) hoverRules.push(`background-color: ${suggestedActionBackgroundColorOnHover} !important;`);
    if (suggestedActionBorderColorOnHover) hoverRules.push(`border-color: ${suggestedActionBorderColorOnHover} !important;`);
    if (suggestedActionBorderStyleOnHover) hoverRules.push(`border-style: ${suggestedActionBorderStyleOnHover} !important;`);
    if (suggestedActionBorderWidthOnHover !== undefined) hoverRules.push(`border-width: ${toPx(suggestedActionBorderWidthOnHover)} !important;`);
    if (suggestedActionTextColorOnHover) hoverRules.push(`color: ${suggestedActionTextColorOnHover} !important;`);
    if (hoverRules.length) css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):not(:active):hover { ${hoverRules.join(" ")} }\n`;

    // 6. Focus styles (when not hover/active/disabled)
    const focusRules: string[] = [];
    if (suggestedActionBackgroundColorOnFocus) focusRules.push(`background-color: ${suggestedActionBackgroundColorOnFocus} !important;`);
    if (suggestedActionBorderColorOnFocus) focusRules.push(`border-color: ${suggestedActionBorderColorOnFocus} !important;`);
    if (suggestedActionBorderStyleOnFocus) focusRules.push(`border-style: ${suggestedActionBorderStyleOnFocus} !important;`);
    if (suggestedActionBorderWidthOnFocus !== undefined) focusRules.push(`border-width: ${toPx(suggestedActionBorderWidthOnFocus)} !important;`);
    if (suggestedActionTextColorOnFocus) focusRules.push(`color: ${suggestedActionTextColorOnFocus} !important;`);
    if (focusRules.length) css += `${baseSelector}:not(:disabled):not([aria-disabled="true"]):not(:active):not(:hover):focus { ${focusRules.join(" ")} }\n`;

    // 7. Keyboard focus indicator (outline synthesis)
    if (
        suggestedActionKeyboardFocusIndicatorBorderColor ||
        suggestedActionKeyboardFocusIndicatorBorderRadius !== undefined ||
        suggestedActionKeyboardFocusIndicatorBorderStyle ||
        suggestedActionKeyboardFocusIndicatorBorderWidth !== undefined ||
        suggestedActionKeyboardFocusIndicatorInset !== undefined
    ) {
        const color = suggestedActionKeyboardFocusIndicatorBorderColor ?? "currentColor";
        const style = suggestedActionKeyboardFocusIndicatorBorderStyle ?? "solid";
        const width = toPx(suggestedActionKeyboardFocusIndicatorBorderWidth) ?? "2px";
        let extra = `outline: ${width} ${style} ${color} !important;`;
        if (suggestedActionKeyboardFocusIndicatorBorderRadius !== undefined) {
            extra += ` border-radius: ${toPx(suggestedActionKeyboardFocusIndicatorBorderRadius)} !important;`;
        }
        if (suggestedActionKeyboardFocusIndicatorInset !== undefined) {
            extra += ` outline-offset: ${toPx(suggestedActionKeyboardFocusIndicatorInset)} !important;`;
        }
        css += `${baseSelector}:focus-visible, ${baseSelector}[data-fui-focus-visible] { ${extra} }\n`;
    }

    return css ? css.trim() : null;
}
