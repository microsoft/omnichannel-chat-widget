import React, { useCallback } from "react";
import { Suggestion, SuggestionList } from "@fluentui-copilot/react-copilot";
import { ISuggestionsProps } from "./interfaces/ISuggestionsProps";
import { ISuggestionItem } from "./interfaces/ISuggestionItem";
import { createSuggestionsStyles } from "./common/utils/suggestionsStyleUtils";
import { defaultSuggestionsProps } from "./common/defaultProps/defaultSuggestionsProps";

/**
 * Suggestions component that displays a list of suggested actions
 */
export const Suggestions = (props: ISuggestionsProps) => {
    const controlProps = { ...defaultSuggestionsProps.controlProps, ...props.controlProps };
    const styleProps = { ...defaultSuggestionsProps.styleProps, ...props.styleProps };
    const componentOverrides = props.componentOverrides || {};
    const suggestions = controlProps.suggestions ?? defaultSuggestionsProps.controlProps?.suggestions ?? [];
   
    // Directly generate styles (cost minimal; memoization not critical here)
    const dynamicStyles = createSuggestionsStyles(styleProps);

    const handleSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        if (controlProps.disabled || suggestion.disabled) return;
        controlProps.onSuggestionClick?.(suggestion);
        if (controlProps.autoHide) {
            controlProps.onSuggestionsClear?.();
        }
    }, [controlProps]);

    if (!suggestions?.length) {
        return null;
    }

    return (
        <SuggestionList
            horizontalAlignment={controlProps.horizontalAlignment}
            action={componentOverrides.action}
            style={styleProps.containerStyleProps}
            aria-label={controlProps.ariaLabel}
        >
            {dynamicStyles && <style>{dynamicStyles}</style>}
            {suggestions.map((suggestion, index) => {
                const keyBase = suggestion.text ?? (suggestion.value != null ? String(suggestion.value) : String(index));
                return (
                    <Suggestion
                        key={`suggestion-${keyBase}`}
                        disabled={controlProps.disabled || suggestion.disabled}
                        icon={componentOverrides.icon}
                        mode={controlProps.mode}
                        designVersion={controlProps.designVersion}
                        appearance={controlProps.appearance}
                        size={controlProps.size}
                        shape={controlProps.shape}
                        iconPosition={controlProps.iconPosition}
                        disabledFocusable={controlProps.disabledFocusable}
                        as={controlProps.as}
                        onClick={() => handleSuggestionClick(suggestion)}
                    >
                        {suggestion.text}
                    </Suggestion>
                );
            })}
        </SuggestionList>
    );
};

export default Suggestions;
