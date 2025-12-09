import { AdaptiveCardJson } from "../types";
import { CARD_TYPES } from "../constants/constants";

/**
 * Validates that the given output matches an Adaptive Card schema.
 * Accepts both standard AdaptiveCard and EscalationToolAdaptiveCard types.
 */
export const isValidAdaptiveCard = (output: any): output is AdaptiveCardJson => {
  if (!output || typeof output !== "object") return false;
  
  // Accept both standard and escalation card types
  if (output.type !== CARD_TYPES.ADAPTIVE_CARD) {
    return false;
  }
  
  return true;
};
