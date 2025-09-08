import { CSSProperties } from "react";

// Style props specifically for Suggested Action buttons (mirrors Web Chat parity keys)
export interface ISuggestionsStyleProps {
    // SuggestionsList container props
    containerStyleProps?: CSSProperties;

    // === Web Chat compatibility layer ===
    // Legacy style mappings to maintain backward compatibility with existing Web Chat implementations
    suggestedActionBackgroundColor?: string;
    suggestedActionBorderColor?: string;
    suggestedActionBorderStyle?: string;
    suggestedActionBorderWidth?: string | number;
    suggestedActionTextColor?: string;
    suggestedActionBorderRadius?: string | number;
    suggestedActionHeight?: string | number;
    suggestedActionImageHeight?: string | number;
    suggestedActionBackgroundColorOnActive?: string;
    suggestedActionBorderColorOnActive?: string;
    suggestedActionBorderStyleOnActive?: string;
    suggestedActionBorderWidthOnActive?: string | number;
    suggestedActionTextColorOnActive?: string;
    suggestedActionBackgroundColorOnDisabled?: string;
    suggestedActionBorderColorOnDisabled?: string;
    suggestedActionBorderStyleOnDisabled?: string;
    suggestedActionBorderWidthOnDisabled?: string | number;
    suggestedActionTextColorOnDisabled?: string;
    suggestedActionBackgroundColorOnFocus?: string;
    suggestedActionBorderColorOnFocus?: string;
    suggestedActionBorderStyleOnFocus?: string;
    suggestedActionBorderWidthOnFocus?: string | number;
    suggestedActionTextColorOnFocus?: string;
    suggestedActionBackgroundColorOnHover?: string;
    suggestedActionBorderColorOnHover?: string;
    suggestedActionBorderStyleOnHover?: string;
    suggestedActionBorderWidthOnHover?: string | number;
    suggestedActionTextColorOnHover?: string;
    suggestedActionKeyboardFocusIndicatorBorderColor?: string;
    suggestedActionKeyboardFocusIndicatorBorderRadius?: string | number;
    suggestedActionKeyboardFocusIndicatorBorderStyle?: string;
    suggestedActionKeyboardFocusIndicatorBorderWidth?: string | number;
    suggestedActionKeyboardFocusIndicatorInset?: string | number;
}
