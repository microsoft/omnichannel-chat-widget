import { IStyle } from "@fluentui/react";

export const defaultCitationPaneContentStyles: IStyle = {
    fontSize: "1em", // Use relative units for better scaling
    lineHeight: "1.5", // Already relative, good for scaling
    marginBottom: "0", // No bottom margin since close button has top margin
    flex: "1", // Allow content to grow and push close button to bottom
    overflow: "auto", // Enable scrolling for long content
    paddingRight: "0.125em" // Reduced padding to give more space for text at high zoom (scalable)
};