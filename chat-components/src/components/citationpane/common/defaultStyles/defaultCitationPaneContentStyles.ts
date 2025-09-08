import { IStyle } from "@fluentui/react";

export const defaultCitationPaneContentStyles: IStyle = {
    fontSize: "14px",
    lineHeight: "1.5",
    marginBottom: "0", // No bottom margin since close button has top margin
    flex: "1", // Allow content to grow and push close button to bottom
    overflow: "auto", // Enable scrolling for long content
    paddingRight: "4px" // Small padding to prevent scrollbar from touching border
};