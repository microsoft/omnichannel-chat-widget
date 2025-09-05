import { fireEvent, render, screen } from "@testing-library/react";

import React from "react";
import WebChatContainerStateful from "../WebChatContainerStateful";

describe("WebChatContainerStateful citation click", () => {
    it("opens citation pane when citation link clicked", () => {
        // Provide a minimal render; the container registers a delegated click handler on mount
        render(<WebChatContainerStateful /> as any);

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
