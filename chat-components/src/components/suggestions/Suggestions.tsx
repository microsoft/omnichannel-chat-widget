import React, { useCallback } from "react";
import {
    Suggestion,
    SuggestionList,
} from "@fluentui-copilot/react-copilot";
import { ISuggestionsProps, ISuggestionItem } from "./interfaces/ISuggestionsProps";
import { defaultSuggestionsProps } from "./common/defaultProps/defaultSuggestionsProps";

/**
 * Suggestions component that displays a list of suggested actions
 */
export const Suggestions = (props: ISuggestionsProps) => {
    
    // Build suggestions props with deep merge for containerStyleProps
    const suggestionsProps = {
        ...defaultSuggestionsProps,
        ...props,
        // Deep merge containerStyleProps to preserve defaults
        containerStyleProps: {
            ...defaultSuggestionsProps.containerStyleProps,
            ...props.containerStyleProps
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        if (suggestionsProps.disabled || suggestion.disabled) return;

        suggestionsProps.onSuggestionClick?.(suggestion);

        // Auto-hide suggestions after click if enabled
        if (suggestionsProps.autoHide) {
            suggestionsProps.onSuggestionsClear?.();
        }
    }, [suggestionsProps]);

    // Don't render if no suggestions
    if (!suggestionsProps.suggestions?.length) {
        return null;
    }
    return (
        // <div style={{
        //     width: "100%",
        //     display: "flex",
        //     justifyContent: horizontalAlignment === "start" ? "flex-start" : "flex-end",
        //     ...containerStyleProps
        // }}>
        <SuggestionList
            horizontalAlignment={suggestionsProps.horizontalAlignment || "end"}
            action={suggestionsProps.action}
            style={suggestionsProps.containerStyleProps}
        >
            {suggestionsProps.suggestions.map((suggestion, index) => (
                <Suggestion
                    key={`suggestion-${index}-${suggestion.text}`}
                    disabled={suggestionsProps.disabled || suggestion.disabled}
                    icon={suggestionsProps.icon}
                    onClick={() => handleSuggestionClick(suggestion)}
                    {...suggestionsProps}
                >
                    {suggestion.text}
                </Suggestion>
            ))}
        </SuggestionList>
        // </div>
    );
};

export default Suggestions;
