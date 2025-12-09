/**
 * Polling configuration constants
 */
export const POLLING_CONFIG = {
  INTERVAL_MS: 50,
  MAX_TIMEOUT_MS: 60000,
} as const;

/**
 * Calculate maximum polling attempts
 */
export const MAX_POLL_ATTEMPTS = 
  POLLING_CONFIG.MAX_TIMEOUT_MS / POLLING_CONFIG.INTERVAL_MS;

/**
 * Payload types supported by the widget
 */
export enum PayloadType {
  ADAPTIVE_CARD = "adaptive-card",
  ESCALATION_CARD = "escalation-card"
}

/**
 * Payload type mappings
 */
export const PAYLOAD_TYPES = {
  ADAPTIVE_CARD: PayloadType.ADAPTIVE_CARD,
  ESCALATION_CARD: PayloadType.ESCALATION_CARD
} as const;

/**
 * Card type mappings for validation
 */
export const CARD_TYPES = {
  ADAPTIVE_CARD: "AdaptiveCard"
} as const;
