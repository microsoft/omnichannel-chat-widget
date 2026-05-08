import { Page } from "playwright";
import { getFocusedInfo, FocusedElementInfo } from "./keyboardLoop";

/**
 * Tab-order assertion helper. Use to lock down the focus traversal of a
 * critical flow (open chat, send message, file upload, transcript request,
 * end chat, reconnect). Each entry in `expected` is a predicate matched
 * against `document.activeElement` after one Tab press.
 *
 * Returns the actual trail observed so test failures show the divergence.
 */
export interface TabOrderStep {
    label: string;
    match: (info: FocusedElementInfo) => boolean;
}

export interface TabOrderResult {
    ok: boolean;
    trail: { step: number; label: string; matched: boolean; info: FocusedElementInfo }[];
}

export async function expectTabOrder(
    page: Page,
    expected: TabOrderStep[],
): Promise<TabOrderResult> {
    const trail: TabOrderResult["trail"] = [];
    let allOk = true;
    for (let i = 0; i < expected.length; i++) {
        await page.keyboard.press("Tab");
        const info = await getFocusedInfo(page);
        const matched = expected[i].match(info);
        if (!matched) allOk = false;
        trail.push({ step: i, label: expected[i].label, matched, info });
    }
    return { ok: allOk, trail };
}

/**
 * Convenience matcher factory: returns a step that expects the focused
 * element's id to equal `id`.
 */
export function focusedHasId(label: string, id: string): TabOrderStep {
    return { label, match: (info) => info.id === id };
}

/**
 * Convenience matcher factory: returns a step that expects the focused
 * element's aria-label to match `pattern`.
 */
export function focusedAriaLabelMatches(label: string, pattern: RegExp): TabOrderStep {
    return { label, match: (info) => !!info.ariaLabel && pattern.test(info.ariaLabel) };
}

/**
 * Convenience matcher factory: returns a step that expects the focused
 * element to carry one of the given roles.
 */
export function focusedHasRole(label: string, ...roles: string[]): TabOrderStep {
    return { label, match: (info) => !!info.role && roles.includes(info.role) };
}
