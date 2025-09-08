import { useCallback, useMemo } from "react";
import { useSuggestionsAdapter } from "./useSuggestionsAdapter";
import type { ISuggestionsProps } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionsProps";

export interface UseChatSuggestionsOptions {
    props?: ISuggestionsProps | undefined;
    autoHide?: boolean; // default true
}

/**
 * Provides suggestion lifecycle + merges upstream suggestion props into a single suggestionsProps object.
 */
export function useSuggestionsState(options?: UseChatSuggestionsOptions) {
    const { suggestions, setShouldShowSuggestions, onSuggestionClick } = useSuggestionsAdapter();
    const upstream = options?.props ?? {};
    const autoHide = options?.autoHide !== false; // default true

    const suggestionsProps: ISuggestionsProps = useMemo(() => ({
        controlProps: {
            ...upstream.controlProps,
            suggestions,
            onSuggestionClick: onSuggestionClick,
            onSuggestionsClear: () => setShouldShowSuggestions(false),
            autoHide,
            horizontalAlignment: upstream.controlProps?.horizontalAlignment
        },
        styleProps: upstream.styleProps,
        componentOverrides: upstream.componentOverrides
    }), [upstream, suggestions, onSuggestionClick, setShouldShowSuggestions, autoHide]);

    const hideSuggestions = useCallback(() => setShouldShowSuggestions(false), [setShouldShowSuggestions]);
    const showSuggestions = useCallback(() => setShouldShowSuggestions(true), [setShouldShowSuggestions]);

    return {
        suggestionsProps,
        suggestions,
        hideSuggestions,
        showSuggestions
    };
}
