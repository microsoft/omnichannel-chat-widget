import { SuggestionProps, SuggestionListProps } from "@fluentui-copilot/react-copilot";
import { ISuggestionItem } from "./ISuggestionItem";

/**
 * Control props for the Suggestions component.
 */
export interface ISuggestionsControlProps extends Partial<Omit<SuggestionProps, "onClick" | "children" | "root" | "icon">> {
    /** Horizontal alignment for the list container. */
    horizontalAlignment?: SuggestionListProps["horizontalAlignment"]; 
    /** Callback fired when a suggestion is clicked. */
    onSuggestionClick?: (suggestion: ISuggestionItem) => void;
    /** Callback to clear suggestions (used with autoHide). */
    onSuggestionsClear?: () => void;
    /** Auto-hide the list after a suggestion is selected. */
    autoHide?: boolean;
    /** Data set of suggestions to render. */
    suggestions?: ISuggestionItem[];
  
    /** Accessible label for the suggestion list wrapper. */
    ariaLabel?: string;
}
