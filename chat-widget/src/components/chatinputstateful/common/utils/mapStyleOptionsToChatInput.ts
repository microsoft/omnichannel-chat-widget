import { IChatInputStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/chatinput/interfaces/IChatInputStyleProps";
import { ISuggestionsStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionsStyleProps";

// Keys related to ChatInput
const chatInputKeys = [
    "sendBoxButtonColor",
    "sendBoxButtonColorOnActive",
    "sendBoxButtonColorOnDisabled",
    "sendBoxButtonColorOnFocus",
    "sendBoxButtonColorOnHover",
    "sendBoxButtonShadeColor",
    "sendBoxButtonShadeColorOnActive",
    "sendBoxButtonShadeColorOnDisabled",
    "sendBoxButtonShadeColorOnFocus",
    "sendBoxButtonShadeColorOnHover",
    "sendBoxButtonShadeBorderRadius",
    "sendBoxButtonShadeInset",
    "sendBoxButtonKeyboardFocusIndicatorBorderColor",
    "sendBoxButtonKeyboardFocusIndicatorBorderRadius",
    "sendBoxButtonKeyboardFocusIndicatorBorderStyle",
    "sendBoxButtonKeyboardFocusIndicatorBorderWidth",
    "sendBoxButtonKeyboardFocusIndicatorInset",
    "sendBoxBackground",
    "sendBoxBorderTop",
    "sendBoxBorderRight",
    "sendBoxBorderBottom",
    "sendBoxBorderLeft",
    "sendBoxHeight",
    "sendBoxMaxHeight",
    "sendBoxTextColor",
    "sendBoxDisabledTextColor",
    "sendBoxPlaceholderColor"
];

// Keys related to suggestions
const suggestionKeys = [
    "suggestedActionBackgroundColor",
    "suggestedActionBorderColor",
    "suggestedActionBorderStyle",
    "suggestedActionBorderWidth",
    "suggestedActionTextColor",
    "suggestedActionBorderRadius",
    "suggestedActionHeight",
    "suggestedActionImageHeight",
    "suggestedActionBackgroundColorOnActive",
    "suggestedActionBorderColorOnActive",
    "suggestedActionBorderStyleOnActive",
    "suggestedActionBorderWidthOnActive",
    "suggestedActionTextColorOnActive",
    "suggestedActionBackgroundColorOnDisabled",
    "suggestedActionBorderColorOnDisabled",
    "suggestedActionBorderStyleOnDisabled",
    "suggestedActionBorderWidthOnDisabled",
    "suggestedActionTextColorOnDisabled",
    "suggestedActionBackgroundColorOnFocus",
    "suggestedActionBorderColorOnFocus",
    "suggestedActionBorderStyleOnFocus",
    "suggestedActionBorderWidthOnFocus",
    "suggestedActionTextColorOnFocus",
    "suggestedActionBackgroundColorOnHover",
    "suggestedActionBorderColorOnHover",
    "suggestedActionBorderStyleOnHover",
    "suggestedActionBorderWidthOnHover",
    "suggestedActionTextColorOnHover",
    "suggestedActionKeyboardFocusIndicatorBorderColor",
    "suggestedActionKeyboardFocusIndicatorBorderRadius",
    "suggestedActionKeyboardFocusIndicatorBorderStyle",
    "suggestedActionKeyboardFocusIndicatorBorderWidth",
    "suggestedActionKeyboardFocusIndicatorInset"
];

export interface MappedStyleResult {
    chatInput: Partial<IChatInputStyleProps>;
    suggestions: Partial<ISuggestionsStyleProps>;
}

export const mapWebChatSendBoxStyles = (s?: Record<string, unknown>): MappedStyleResult => {
    const chatInput: Partial<IChatInputStyleProps> = {};
    const suggestions: Partial<ISuggestionsStyleProps> = {};
    if (!s) return { chatInput, suggestions };

    for (const key of chatInputKeys) {
        const val = (s as Record<string, unknown>)[key];
        if (val != null) {
            (chatInput as Record<string, unknown>)[key] = val;
        }
    }
    for (const key of suggestionKeys) {
        const val = (s as Record<string, unknown>)[key];
        if (val != null) {
            (suggestions as Record<string, unknown>)[key] = val;
        }
    }
    return { chatInput, suggestions };
};