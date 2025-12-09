/**
 * OmnichannelWidget
 * ------------------
 * A robust, React component that safely renders OpenAI tool output.
 *
 * Key Features:
 * - Handles delayed availability of `window.openai`
 * - Listens for asynchronous OpenAI tool output events
 * - Polls for synchronous tool output injection
 * - Validates Adaptive Card structure before rendering
 * - Ensures tool output is processed exactly once (race-safe)
 * - Cleans up timers + event listeners properly
 * - Protects against React Strict Mode double-mount behavior
 */

import React, { useEffect, useState, useCallback, useRef } from "react";
import AdaptiveCardRenderer from "./components/AdaptiveCardRenderer";
import { handleAdaptiveCardAction } from "./actions/adaptiveCardActions";
import { handleEscalationCardAction } from "./actions/escalationCardActions";
import { POLLING_CONFIG, MAX_POLL_ATTEMPTS, PAYLOAD_TYPES } from "./constants/constants";
import { isValidAdaptiveCard } from "./utils/validation";
import { AdaptiveCardJson, ToolResponseMetadata, OpenAIWindow } from "./types/index";

export default function OmnichannelWidget(): React.JSX.Element {
  /** -------------------------
   *  React State
   *  -------------------------
   */
  const [cardJson, setCardJson] = useState<AdaptiveCardJson | null>(null);
  const [payloadType, setPayloadType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /** -------------------------
   *  Internal Refs (not reactive)
   *  -------------------------
   */

  // Tracks whether component is still mounted
  const isMounted = useRef<boolean>(true);

  // Stores interval + timeout handles to ensure cleanup
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  // Prevents processing tool output more than once (race-condition guard)
  const hasProcessed = useRef<boolean>(false);

  /**
   * Utility wrapper to ensure React state updates don't run after unmount.
   */
  const finalize = useCallback((fn: () => void) => {
    if (!isMounted.current) return;
    fn();
  }, []);

  /**
   * Clears all timers related to polling + timeout.
   * Prevents memory leaks and duplicate timers in React Strict Mode.
   */
  const clearTimers = useCallback(() => {
    Object.values(timers.current).forEach((t) => clearTimeout(t));
    timers.current = {};
  }, []);

  /**
   * Core function that processes tool output.
   * Ensures output is validated, type identified, and UI updated exactly once.
   */
  const processToolOutput = useCallback(
    (output: any, meta: ToolResponseMetadata | undefined) => {
      // Prevent double-processing
      if (!isMounted.current || hasProcessed.current) return false;

      hasProcessed.current = true;
      clearTimers();

      try {
        if (!output || typeof output !== "object") {
          finalize(() => {
            setError("Invalid or empty output received");
            setIsLoading(false);
          });
          return false;
        }

        const type = meta?.payloadType || null;

        // Validate Adaptive Card payload
        if (!isValidAdaptiveCard(output)) {
          finalize(() => {
            setError("Invalid AdaptiveCard structure");
            setIsLoading(false);
          });
          return false;
        }

        // Success: update UI
        finalize(() => {
          setPayloadType(type);
          setCardJson(output);
          setError(null);
          setIsLoading(false);
        });

        return true;
      } catch (err: any) {
        console.error("Processing error:", err);
        finalize(() => {
          setError(`Processing error: ${err.message}`);
          setIsLoading(false);
        });
        return false;
      }
    },
    [isValidAdaptiveCard, clearTimers, finalize]
  );

  /**
   * Attempts to read synchronous tool output from window.openai.toolOutput.
   * Returns true if successful, false otherwise.
   */
  const loadData = useCallback(() => {
    if (!isMounted.current || hasProcessed.current) return false;

    try {
      const openaiWindow = window as OpenAIWindow;
      const output = openaiWindow.openai?.toolOutput;
      const meta = openaiWindow.openai?.toolResponseMetadata;

      // If data is available immediately, process it
      if (output && Object.keys(output).length > 0) {
        return processToolOutput(output, meta);
      }
      return false;
    } catch (err: any) {
      console.error("Load data error:", err);
      return false;
    }
  }, [processToolOutput]);

  /**
   * Main side-effect responsible for:
   * - Immediate synchronous load attempt
   * - Polling window.openai every 50ms
   * - Listening for async OpenAI tool output events
   * - Timeout fallback
   * - Cleanup on unmount
   */
  useEffect(() => {
    isMounted.current = true;

    // Before polling or listening, check if output is already present
    if (loadData()) return;

    /** -------------------
     * Polling Strategy
     * -------------------
     * Poll every 50ms until:
     * - output is found
     * - OR timeout is reached
     */
    let attempts = 0;

    timers.current.poll = setInterval(() => {
      if (hasProcessed.current) return;

      attempts++;
      if (loadData()) return;

      if (attempts >= MAX_POLL_ATTEMPTS) {
        clearTimers();
        finalize(() => {
          setError("Timeout: No data received from OpenAI");
          setIsLoading(false);
        });
      }
    }, POLLING_CONFIG.INTERVAL_MS);

    /**
     * Event Listener Strategy
     * -----------------------
     * Listens for the asynchronous event fired by platform:
     * window.dispatchEvent(new CustomEvent("openai-tool-output", { detail: ... }))
     */
    const handleEvent = (event: CustomEvent) => {
      if (!isMounted.current || hasProcessed.current) return;
      const output = event.detail || {};
      const openaiWindow = window as OpenAIWindow;
      const meta = openaiWindow.openai?.toolResponseMetadata;
      processToolOutput(output, meta);
    };

    window.addEventListener("openai-tool-output", handleEvent as EventListener);

    /**
     * Hard Timeout Strategy
     * ---------------------
     * Ensures the widget never waits forever.
     */
    timers.current.timeout = setTimeout(() => {
      if (!hasProcessed.current) {
        finalize(() => {
          setError("Timeout: No data received from OpenAI");
          setIsLoading(false);
        });
      }
    }, POLLING_CONFIG.MAX_TIMEOUT_MS);

    /** -------------------
     * Cleanup
     * -------------------
     */
    return () => {
      isMounted.current = false;
      clearTimers();
      window.removeEventListener("openai-tool-output", handleEvent as EventListener);
    };
  }, [loadData, processToolOutput, finalize, clearTimers]);

  /** ---------------------
   * Render Logic
   * ---------------------
   */
  if (isLoading) {
    return <div style={{ padding: 20 }}>Loading adaptive card…</div>;
  }

  if (error) {
    return (
      <div style={{ padding: 20, color: "#d32f2f" }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {payloadType === PAYLOAD_TYPES.ADAPTIVE_CARD && cardJson && (
        <AdaptiveCardRenderer cardJson={cardJson} actionHandler={handleAdaptiveCardAction} />
      )}
      {payloadType === PAYLOAD_TYPES.ESCALATION_CARD && cardJson && (
        <AdaptiveCardRenderer cardJson={cardJson} actionHandler={handleEscalationCardAction} />
      )}
    </div>
  );
}
