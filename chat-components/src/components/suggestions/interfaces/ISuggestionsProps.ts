import { CSSProperties } from "react";
import { Slot } from "@fluentui/react-components";

export interface ISuggestionItem {
    /**
     * The text to display on the suggestion button
     */
    text: string;
    
    /**
     * The value to send when the suggestion is clicked
     */
    value?: any;
    
    /**
     * Display text for the suggestion (optional, defaults to text)
     */
    displayText?: string;
    
    /**
     * The type of action this suggestion represents
     */
    type?: "imBack" | "postBack" | "messageBack" | "openUrl" | string;
    
    /**
     * Optional image URL for the suggestion
     */
    image?: string;
    
    /**
     * Alt text for the image
     */
    imageAlt?: string;
    
    /**
     * Whether this suggestion is disabled
     */
    disabled?: boolean;

    /**
     * Icon name or identifier for the suggestion
     */
    iconName?: string;
}

export interface ISuggestionsProps {
    // === SuggestionList props ===
    /**
     * Horizontal alignment of the suggestion list
     */
    horizontalAlignment?: "end" | "start";

    /**
     * Slots for the suggestion list components - for suggestion items
     */
    action?: Slot<"span">;

    // === Suggestion props ===
    /**
     * Default mode for all suggestions
     */
    mode?: "canvas" | "sidecar";
    
    /**
     * Default design version for all suggestions
     */
    designVersion?: "current" | "previous" | "next";

    /**
     * Default icon for all suggestions
     */
    icon?: Slot<"span">;

    /**
     * Default appearance for all suggestions
     */
    appearance?: "outline" | "subtle" | "secondary" | "primary" | "transparent";
    
    /**
     * Default size for all suggestions
     */
    size?: "small" | "medium" | "large";
    
    /**
     * Default shape for all suggestions
     */
    shape?: "rounded" | "square" | "circular";
    
    /**
     * Default icon position for all suggestions
     */
    iconPosition?: "before" | "after";
    
    /**
     * Default disabled focusable for all suggestions
     */
    disabledFocusable?: boolean;
    
    /**
     * Default element type for all suggestions
     */
    as?: "a" | "button";

    // === Suggestions custom props ===
    /**
     * Array of suggestion items to display
     */
    suggestions?: ISuggestionItem[];
    
    /**
     * Whether suggestions are disabled
     */
    disabled?: boolean;
    
    /**
     * Callback when a suggestion is clicked
     */
    onSuggestionClick?: (suggestion: ISuggestionItem) => void;
    
    /**
     * Callback when suggestions should be cleared/hidden
     */
    onSuggestionsClear?: () => void;
    
    /**
     * Custom aria label for the suggestions container
     */
    ariaLabel?: string;
    
    /**
     * Whether to auto-hide suggestions after click
     */
    autoHide?: boolean;
    /**
     * Style for the main suggestions container
     */
    containerStyleProps?: CSSProperties;
}
