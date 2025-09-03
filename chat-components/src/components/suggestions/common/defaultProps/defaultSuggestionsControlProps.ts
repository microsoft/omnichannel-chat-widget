import { ISuggestionsControlProps } from "../../interfaces/ISuggestionsProps";

/**
 * Default control properties for Suggestions component
 */
export const getDefaultSuggestionsControlProps = (): ISuggestionsControlProps => ({
    suggestions: [],
    disabled: false,
    maxSuggestions: 10,
    autoHide: true,
    ariaLabel: "Suggested actions",
    suggestionListConfig: {
        horizontalAlignment: "end"
    }
});
