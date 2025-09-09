import CitationPane from "./CitationPane";
import { ICitationPaneProps } from "./interfaces/ICitationPaneProps";
import React from "react";

/**
 * Test component to verify CitationPane scaling behavior at different zoom levels
 * This demonstrates how the component responds to 50% to 400% view sizes
 */
export const CitationPaneScalingTest: React.FC = () => {
    const baseProps: ICitationPaneProps = {
        controlProps: {
            id: "scaling-test-citation",
            titleText: "Scaling Test Citation",
            contentHtml: `
                <div>
                    <p>This citation pane is designed to scale properly from 50% to 400% zoom levels.</p>
                    <p><strong>Key improvements for scaling:</strong></p>
                    <ul>
                        <li>Uses <code>em</code> units instead of <code>px</code> for dimensions</li>
                        <li>Scalable padding, margins, and positioning</li>
                        <li>Relative font sizes throughout</li>
                        <li>Container-relative maximum height instead of viewport-based</li>
                    </ul>
                    <p><strong>Test Instructions:</strong></p>
                    <ol>
                        <li>Use your browser's zoom controls (Ctrl/Cmd + or -)</li>
                        <li>Test zoom levels: 50%, 75%, 100%, 150%, 200%, 300%, 400%</li>
                        <li>Verify all elements remain proportional and usable</li>
                        <li>Check that buttons remain clickable and text remains readable</li>
                    </ol>
                </div>
            `,
            closeButtonText: "Close Test",
            onClose: () => {
                console.log("Scaling test close button clicked at current zoom level");
            }
        }
    };

    return (
        <div style={{ 
            padding: "2em", 
            backgroundColor: "#f5f5f5",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div style={{ maxWidth: "600px" }}>
                <h2 style={{ marginBottom: "1em", textAlign: "center" }}>
                    CitationPane Scaling Test
                </h2>
                <p style={{ marginBottom: "2em", textAlign: "center", fontSize: "0.9em" }}>
                    Test this component at browser zoom levels from 50% to 400%
                </p>
                <CitationPane {...baseProps} />
            </div>
        </div>
    );
};

export default CitationPaneScalingTest;
