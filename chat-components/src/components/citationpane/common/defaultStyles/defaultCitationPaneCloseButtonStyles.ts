import { IStyle } from "@fluentui/react";

export const defaultCitationPaneCloseButtonStyles: IStyle = {
    marginTop: "16px", // Space between content and close button
    alignSelf: "center", // Center the button horizontally
    backgroundColor: "#f3f2f1",
    border: "1px solid #d2d0ce",
    borderRadius: "4px",
    color: "#323130",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    minHeight: "32px",
    minWidth: "80px",
    padding: "8px 16px",
    selectors: {
        ":hover": {
            backgroundColor: "#e1dfdd",
            borderColor: "#c8c6c4"
        },
        ":focus": {
            outline: "2px solid #0078d4",
            outlineOffset: "2px"
        },
    },
};