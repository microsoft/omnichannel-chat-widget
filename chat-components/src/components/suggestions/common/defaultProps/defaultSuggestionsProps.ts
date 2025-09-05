
import { ISuggestionsProps } from "../../interfaces/ISuggestionsProps";

/**
 * Default control properties for Suggestions component
 */
export const defaultSuggestionsProps: ISuggestionsProps = {
    controlProps: {
        suggestions: [],
        disabled: false,
        autoHide: true,
        ariaLabel: "Suggested actions",
        mode: "sidecar",
        designVersion: "next",
        shape: "rounded",
        size: "medium",
        horizontalAlignment: "end"
    },
    styleProps: {
        containerStyleProps: {
            width: "100%",
            boxSizing: "border-box",
            padding: "5px 5px",
            backgroundColor: "#F7F7F9"
        }
    }
};
