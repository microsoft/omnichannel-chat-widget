import { IStyle } from "@fluentui/react";

export const defaultCitationPaneGeneralStyles: IStyle = {
    position: "relative", // Required for absolute positioning of top close button
    paddingTop: "40px", // Space for top close button to prevent overlap
    padding: "16px",
    backgroundColor: "#ffffff",
    border: "1px solid #d2d0ce",
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    minHeight: "120px", // Minimum height to ensure proper layout
    maxHeight: "80vh", // Prevent the pane from becoming too tall on screen
    overflow: "hidden" // Hide overflow on container, let content area handle scrolling
};

