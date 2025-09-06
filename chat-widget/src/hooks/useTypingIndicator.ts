import { useCallback, useRef } from "react";

export interface UseTypingIndicatorOptions {
    enabled?: boolean;                 // Feature flag
    canSend?: boolean;                 // Unified gating flag (online + not offline)
    idleResetMs?: number;              // Override idle gap (default 2000)
    intervalMs?: number;               // Override periodic interval (default 4000)
    sendTyping?: () => Promise<void> | void; // Transport function
}

// Internal defaults
const DEFAULT_IDLE_RESET_MS = 2000;
const DEFAULT_INTERVAL_MS = 4000;

/**
 * useTypingIndicator
 * Idle + periodic typing emission with minimal surface area.
 * Pass a unified canSend boolean to simplify upstream logic.
 */
export default function useTypingIndicator(options: UseTypingIndicatorOptions) {
    const {
        enabled = true,
        canSend,
        idleResetMs = DEFAULT_IDLE_RESET_MS,
        intervalMs = DEFAULT_INTERVAL_MS,
        sendTyping
    } = options;

    const lastKeypressAtRef = useRef(0);
    const lastSentAtRef = useRef(0);

    const handleUserTextChange = useCallback((value: string) => {
        if (!enabled || !sendTyping || !canSend) return;
        const trimmed = value?.trim();
        if (!trimmed) return;

        const now = Date.now();
        const lastKeypressAt = lastKeypressAtRef.current || 0;
        const lastSentAt = lastSentAtRef.current || 0;
        const idle = now - lastKeypressAt > idleResetMs;
        const elapsed = now - lastSentAt;

        if (!idle && elapsed < intervalMs) {
            lastKeypressAtRef.current = now; // still update keypress time
            return;
        }

        lastKeypressAtRef.current = now;
        try {
            const res = sendTyping();
            if (res && typeof (res as Promise<void>).then === "function") {
                (res as Promise<void>).catch(() => { /* swallow */ });
            }
            lastSentAtRef.current = now;
        } catch { /* non-fatal */ }
    }, [enabled, canSend, idleResetMs, intervalMs, sendTyping]);

    return handleUserTextChange;
}
