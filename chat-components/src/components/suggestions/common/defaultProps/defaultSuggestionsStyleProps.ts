import { ISuggestionsStyleProps } from "../../interfaces/ISuggestionsProps";

/**
 * Default style properties for Suggestions component
 */
export const getDefaultSuggestionsStyleProps = (): ISuggestionsStyleProps => ({
    containerStyleProps: {
        width: "100%",
        boxSizing: "border-box",
        padding: "5px 5px",
        backgroundColor: "transparent"
    }
});
