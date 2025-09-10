import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import React from "react";
import WebChatContainerStateful from "../WebChatContainerStateful";

describe("WebChatContainerStateful citation click", () => {
    it("opens citation pane when citation link clicked", () => {
        // Provide a minimal render; the container registers a delegated click handler on mount
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const omnichannelConfig = { orgId: "your-org-id", widgetId: "your-widget-id", orgUrl :"something" }; // Replace with actual config
        const telemetryConfig = { 
            instrumentationKey: "your-instrumentation-key", 
            chatWidgetVersion: "1.0.0", // Replace with actual version
            chatComponentVersion: "1.0.0", // Replace with actual version
            OCChatSDKVersion: "1.0.0" // Replace with actual version
        }; // Replace with actual config
        render(<WebChatContainerStateful chatSDK={new OmnichannelChatSDK(omnichannelConfig)} telemetryConfig={telemetryConfig} /> as never);

        // Populate global citation map to emulate middleware work
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__ocwCitations = { "cite:1": "Citation body here" };

        // Create an anchor in document that simulates a message link
        const a = document.createElement("a");
        a.setAttribute("href", "cite:1");
        a.textContent = "[1]";
        document.body.appendChild(a);

        // Click it and expect the pane to open
        fireEvent.click(a);

        // The CitationPaneStateful renders a title 'Citation' and the content
        expect(screen.getByText("Citation")).toBeInTheDocument();
        expect(screen.getByText("Citation body here")).toBeInTheDocument();

        // cleanup
        document.body.removeChild(a);
    });
});
