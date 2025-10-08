import { IStyle } from "@fluentui/react";

export const defaultCitationPaneCloseButtonStyles: IStyle = {
    marginTop: "1em", // Space between content and close button (scalable)
    alignSelf: "center", // Center the button horizontally
    backgroundColor: "#f3f2f1",
    border: "1px solid #d2d0ce",
    borderRadius: "0.25em", // Scalable border radius
    color: "#323130",
    cursor: "pointer",
    fontSize: "1em", // Use relative font size for better scaling
    fontWeight: "500",
    minHeight: "2.75em", // A11Y compliant minimum height (44px at 16px base)
    minWidth: "5.5em", // A11Y compliant minimum width (88px at 16px base)
    padding: "0.5em 1em", // Scalable padding
    // Responsive hiding at high zoom levels for better content space
    "@media (min-resolution: 2.5dppx), (min-resolution: 240dpi)": {
        display: "none" // Hide at 250%+ zoom to preserve content space
    },
    selectors: {
        ":hover": {
            backgroundColor: "#e1dfdd",
            borderColor: "#c8c6c4"
        },
        ":focus": {
            outline: "0.125em solid #0078d4", // Scalable outline
            outlineOffset: "0.125em" // Scalable offset
        },
        ":active": {
            backgroundColor: "#d2d0ce",
            borderColor: "#c8c6c4"
        }
    }
};