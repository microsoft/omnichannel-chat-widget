import { useCallback, useEffect, useMemo, useState } from "react";
import { hooks as WebChatHooks } from "botframework-webchat";
import type { ISuggestionItem } from "@microsoft/omnichannel-chat-components/lib/types/components/suggestions/interfaces/ISuggestionItem";

// Limited any usage for Web Chat hooks lacking local typing detail
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { useSuggestedActions, usePerformCardAction, useActivities } = WebChatHooks as any;

export function useSuggestionsAdapter() {
    const [webChatSuggestedActions] = useSuggestedActions();
    const performCardAction = usePerformCardAction();
    const [activities] = useActivities();
    const [shouldShowSuggestions, setShouldShowSuggestions] = useState(false);
    const [lastActivityId, setLastActivityId] = useState<string | null>(null);

    const suggestions: ISuggestionItem[] = useMemo(() => {
        if (!webChatSuggestedActions?.length || !shouldShowSuggestions) return [];
        return webChatSuggestedActions.map((action: unknown) => {
            const a = action as Record<string, unknown>;
            return {
                text: (a.title || a.text || a.displayText || "Action") as string,
                value: a,
                displayText: (a.displayText || a.title || a.text) as string,
                type: (a.type || "postBack") as string,
                disabled: false
            } as ISuggestionItem;
        });
    }, [webChatSuggestedActions, shouldShowSuggestions]);

    const onSuggestionClick = useCallback((suggestion: ISuggestionItem) => {
        try {
            const val = suggestion.value;
            const isCardActionObject = !!val && typeof val === "object" && "type" in (val as Record<string, unknown>);
            if (isCardActionObject) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                performCardAction(val as any);
            } else {
                console.error("Unsupported suggestion value", suggestion);
            }
            setShouldShowSuggestions(false);
        } catch (e) {
            console.warn("Suggestion action error", e);
        }
    }, [performCardAction]);

    useEffect(() => {
        if (webChatSuggestedActions?.length > 0) {
            setShouldShowSuggestions(true);
        }
    }, [webChatSuggestedActions]);

    useEffect(() => {
        if (activities.length > 0) {
            const latest = activities[activities.length - 1];
            if (latest.id && latest.id !== lastActivityId) {
                setLastActivityId(latest.id);
                if (latest.from?.role === "user") {
                    setShouldShowSuggestions(false);
                }
            }
        }
    }, [activities, lastActivityId]);

    return { suggestions, shouldShowSuggestions, setShouldShowSuggestions, onSuggestionClick };
}
