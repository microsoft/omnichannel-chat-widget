import { IStyle } from "@fluentui/react";

export const defaultCitationPaneTopCloseButtonStyles: IStyle = {
    position: "absolute",
    top: "8px",
    right: "8px",
    minWidth: "32px",
    height: "32px",
    padding: "0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#605e5c",
    backgroundColor: "transparent",
    border: "none",
    borderRadius: "4px",
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
        outline: "2px solid #605e5c",
        outlineOffset: "2px"
    }
};