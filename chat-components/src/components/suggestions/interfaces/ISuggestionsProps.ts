import { CSSProperties } from "react";
import { SuggestionListProps } from "@fluentui-copilot/react-suggestions";

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

    /**
     * FluentUI Copilot Suggestion props
     */
    fluentProps?: {
        mode?: "canvas" | "sidecar";
        designVersion?: "current" | "previous" | "next";
        appearance?: "outline" | "subtle" | "secondary" | "primary" | "transparent";
        size?: "small" | "medium" | "large";
        shape?: "rounded" | "square" | "circular";
        iconPosition?: "before" | "after";
        disabledFocusable?: boolean;
        as?: "a" | "button";
    };
}

export interface ISuggestionsControlProps {
    /**
     * Array of suggestion items to display
     */
    suggestions?: ISuggestionItem[];
    
    /**
     * Whether suggestions are disabled
     */
    disabled?: boolean;
    
    /**
     * Maximum number of suggestions to show
     */
    maxSuggestions?: number;
    
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
     * Additional props to pass to SuggestionList component
     */
    suggestionListProps?: Partial<SuggestionListProps>;

    /**
     * Default FluentUI Copilot props for all suggestions
     */
    defaultSuggestionProps?: {
        mode?: "canvas" | "sidecar";
        designVersion?: "current" | "previous" | "next";
        appearance?: "outline" | "subtle" | "secondary" | "primary" | "transparent";
        size?: "small" | "medium" | "large";
        shape?: "rounded" | "square" | "circular";
        iconPosition?: "before" | "after";
        disabledFocusable?: boolean;
        as?: "a" | "button";
    };

    /**
     * SuggestionList specific props
     */
    suggestionListConfig?: {
        horizontalAlignment?: "end" | "start";
        as?: "div";
    };
}

export interface ISuggestionsStyleProps {
    /**
     * Style for the main suggestions container
     */
    containerStyleProps?: CSSProperties;
}

export interface ISuggestionsProps {
    /**
     * Control properties for suggestions behavior
     */
    controlProps?: ISuggestionsControlProps;
    
    /**
     * Style properties for suggestions appearance
     */
    styleProps?: ISuggestionsStyleProps;
    
    /**
     * Component overrides for custom rendering
     */
    componentOverrides?: {
        suggestion?: React.ComponentType<any>;
        icon?: React.ComponentType<any>;
    };
}
