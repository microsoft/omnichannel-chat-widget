import React, { useEffect, useRef, useState, useCallback } from "react";
import * as AC from "adaptivecards";
import "adaptivecards/dist/adaptivecards.css";
import "../assets/styles.css";

export default function AdaptiveCardRenderer({ cardJson, actionHandler }) {
  const containerRef = useRef(null);
  const [actionResponse, setActionResponse] = useState(null);

  // Handle adaptive card actions
  const handleAction = useCallback((action) => {
    if (actionHandler) {
      actionHandler(action, setActionResponse);
    }
  }, [actionHandler]);

  useEffect(() => {
    try {
      const adaptiveCard = new AC.AdaptiveCard();
      adaptiveCard.onExecuteAction = handleAction;

      // Parse and render the card
      adaptiveCard.parse(cardJson);
      const rendered = adaptiveCard.render();

      // Clear and append the rendered card
      if (containerRef.current && rendered) {
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(rendered);
        console.log("[AdaptiveCardRenderer] Card rendered successfully");
      }
    } catch (error) {
      console.error("[AdaptiveCardRenderer] Error rendering card:", error);
    }
  }, [cardJson, handleAction]);

  return (
    <div>
      <div ref={containerRef} />

      {actionResponse && (
        <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc" }}>
          <h4>Action Response:</h4>
          <pre>{JSON.stringify(actionResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}