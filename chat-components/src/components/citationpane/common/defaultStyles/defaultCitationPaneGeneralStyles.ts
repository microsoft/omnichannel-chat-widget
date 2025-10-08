import { IStyle } from "@fluentui/react";

export const defaultCitationPaneGeneralStyles: IStyle = {
    position: "relative", // Required for absolute positioning of top close button
    paddingTop: "2em", // Reduced space for top close button (scalable)
    paddingLeft: "0.75em", // Reduced left padding (scalable)
    paddingRight: "0.75em", // Reduced right padding (scalable)
    paddingBottom: "0.75em", // Reduced bottom padding (scalable)
    backgroundColor: "#ffffff",
    border: "1px solid #d2d0ce",
    borderRadius: "0.5em", // Scalable border radius
    boxShadow: "0px 0.125em 0.25em rgba(0, 0, 0, 0.1)", // Scalable shadow
    display: "flex",
    flexDirection: "column",
    minHeight: "7.5em", // Minimum height to ensure proper layout (scalable)
    maxHeight: "30em", // Container-relative height instead of viewport-based
    overflow: "hidden" // Hide overflow on container, let content area handle scrolling
};