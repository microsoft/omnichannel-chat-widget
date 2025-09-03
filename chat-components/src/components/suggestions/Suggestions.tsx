import React, { useCallback, useMemo } from "react";
import {
    Suggestion,
    SuggestionList,
} from "@fluentui-copilot/react-copilot";
import { ISuggestionsProps, ISuggestionItem } from "./interfaces/ISuggestionsProps";
import { getDefaultSuggestionsControlProps } from "./common/defaultProps/defaultSuggestionsControlProps";
import { getDefaultSuggestionsStyleProps } from "./common/defaultProps/defaultSuggestionsStyleProps";

/**
 * Suggestions component that displays a list of suggested actions
 */
export const Suggestions: React.FC<ISuggestionsProps> = ({
    controlProps,
    styleProps,
    componentOverrides
}) => {
    console.log("Suggestions props:", {
        controlProps,
        styleProps,
        componentOverrides
    });
    // Merge with default props
    const mergedControlProps = useMemo(() => ({
        ...getDefaultSuggestionsControlProps(),
        ...controlProps
    }), [controlProps]);

    const mergedStyleProps = useMemo(() => ({
        ...getDefaultSuggestionsStyleProps(),
        ...styleProps
    }), [styleProps]);

    const {
        suggestions = [],
        disabled = false,
        maxSuggestions = 10,
        autoHide = true,
        ariaLabel = "Suggested actions",
        onSuggestionClick,
        onSuggestionsClear,
        suggestionListProps = {},
        defaultSuggestionProps = {},
        suggestionListConfig = {}
    } = mergedControlProps;

    const {
        containerStyleProps
    } = mergedStyleProps;

    // Handle suggestion click
    const handleSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        if (disabled || suggestion.disabled) return;
        
        onSuggestionClick?.(suggestion);
        
        // Auto-hide suggestions after click if enabled
        if (autoHide) {
            onSuggestionsClear?.();
        }
    }, [disabled, onSuggestionClick, autoHide, onSuggestionsClear]);

    // Don't render if no suggestions
    if (!suggestions?.length) {
        return null;
    }

    // Limit suggestions to maxSuggestions
    const displaySuggestions = suggestions.slice(0, maxSuggestions);

    // Component overrides
    const SuggestionComponent = componentOverrides?.suggestion || Suggestion;
    const IconComponent = componentOverrides?.icon;

    return (
        <div style={{
            width: "100%",
            display: "flex",
            justifyContent: suggestionListConfig?.horizontalAlignment === "start" ? "flex-start" : "flex-end",
            ...containerStyleProps
        }}>
            <SuggestionList
                horizontalAlignment={suggestionListConfig?.horizontalAlignment || "end"}
                {...suggestionListProps}
                style={{
                    width: "100%",
                    maxWidth: "100%",
                    minWidth: "fit-content",
                    ...suggestionListProps?.style
                }}
            >
                {displaySuggestions.map((suggestion, index) => (
                    <SuggestionComponent
                        key={`suggestion-${index}-${suggestion.text}`}
                        disabled={disabled || suggestion.disabled}
                        icon={IconComponent ? <IconComponent /> : undefined}
                        onClick={() => handleSuggestionClick(suggestion)}
                        {...defaultSuggestionProps}
                        {...suggestion.fluentProps}
                    >
                        {suggestion.text}
                    </SuggestionComponent>
                ))}
            </SuggestionList>
        </div>
    );
};

export default Suggestions;
