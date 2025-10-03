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
    minHeight: "2em", // Scalable minimum height
    minWidth: "5em", // Scalable minimum width
    padding: "0.5em 1em", // Scalable padding
    selectors: {
        ":hover": {
            backgroundColor: "#e1dfdd",
            borderColor: "#c8c6c4"
        },
        ":focus": {
            outline: "0.125em solid #0078d4", // Scalable outline
            outlineOffset: "0.125em" // Scalable offset
        },
    },
};