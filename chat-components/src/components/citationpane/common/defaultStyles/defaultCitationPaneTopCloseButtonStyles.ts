import { IStyle } from "@fluentui/react";

export const defaultCitationPaneTopCloseButtonStyles: IStyle = {
    position: "absolute",
    top: "0.5em", // Scalable positioning
    right: "0.5em", // Scalable positioning
    minWidth: "2em", // Scalable minimum width
    height: "2em", // Scalable height
    padding: "0",
    fontSize: "1em", // Scalable font size
    fontWeight: "bold",
    color: "#605e5c",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "0.25em", // Scalable border radius
    cursor: "pointer",
    zIndex: 1000,
    ":hover": {
        backgroundColor: "#f3f2f1",
        color: "#323130"
    },
    ":active": {
        backgroundColor: "#edebe9",
        color: "#201f1e"
    },
    ":focus": {
        outline: "0.125em solid #605e5c", // Scalable outline
        outlineOffset: "0.125em" // Scalable offset
    }
};