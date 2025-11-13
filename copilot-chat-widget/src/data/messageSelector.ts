import { ACSMessageLocal } from '../types';
import { useMemo } from 'react';

/**
 * createMergedMessagesSelector
 * Returns a memoized selector function that merges two inputs:
 * - rawMessages: authoritative messages from the server (ordered array)
 * - overlayMessages: local/optimistic messages that may replace or augment server messages
 *
 * Merge rules implemented here (simple, pragmatic):
 * - If overlay contains an item with the same id as a raw message, the overlay item replaces the raw item in-place
 * - If an overlay item has no id (optimistic/temp message) it is appended to the resulting list
 * - Order of server messages is preserved
 *
 * The selector memoizes by reference equality of the input arrays and returns the same
 * result array instance when inputs are unchanged to help React avoid re-renders.
 */
export function createMergedMessagesSelector() {
  let lastRaw: ACSMessageLocal[] | null = null;
  let lastOverlay: ACSMessageLocal[] | null = null;
  let lastResult: ACSMessageLocal[] | null = null;

  return function mergedSelector(rawMessages: ACSMessageLocal[], overlayMessages: ACSMessageLocal[]) {
    if (lastRaw === rawMessages && lastOverlay === overlayMessages && lastResult) {
      return lastResult;
    }

    const overlayById = new Map<string, ACSMessageLocal>();
    const tempMessages: ACSMessageLocal[] = [];

    for (const o of overlayMessages || []) {
      if (o?.id) overlayById.set(o.id, o);
      else tempMessages.push(o);
    }

    const merged: ACSMessageLocal[] = [];

    for (const r of rawMessages || []) {
      if (r && r.id && overlayById.has(r.id)) {
        merged.push(overlayById.get(r.id)!);
      } else if (r) {
        merged.push(r);
      }
    }

    // Append any overlay messages that have no corresponding server id (optimistic)
    for (const t of tempMessages) merged.push(t);

    lastRaw = rawMessages;
    lastOverlay = overlayMessages;
    lastResult = merged;

    return merged;
  };
}

/**
 * React hook variant using the selector above. It returns a memoized merged array
 * and guarantees stable reference as long as inputs don't change by identity.
 */
export function useMergedMessages(rawMessages: ACSMessageLocal[], overlayMessages: ACSMessageLocal[]) {
  const selector = useMemo(() => createMergedMessagesSelector(), []);
  return useMemo(() => selector(rawMessages, overlayMessages), [selector, rawMessages, overlayMessages]);
}
