import { Page } from "playwright";

/**
 * Helpers for keyboard-only navigation tests.
 *
 * The chat widget has several "focus must stay within the widget" requirements
 * (focus trap on chat button, modal panes, etc.). These helpers codify the
 * Tab / Shift+Tab loop pattern already used in focusTrap.spec.ts so new specs
 * can express the assertion in one line.
 */

export interface FocusedElementInfo {
    tagName: string | null;
    id: string | null;
    classList: string[];
    role: string | null;
    ariaLabel: string | null;
    text: string | null;
}

/**
 * Returns information about `document.activeElement` in the page.
 */
export async function getFocusedInfo(page: Page): Promise<FocusedElementInfo> {
    return page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el) return { tagName: null, id: null, classList: [], role: null, ariaLabel: null, text: null };
        return {
            tagName: el.tagName ? el.tagName.toLowerCase() : null,
            id: el.id || null,
            classList: el.className && typeof el.className === "string" ? el.className.split(/\s+/).filter(Boolean) : [],
            role: el.getAttribute("role"),
            ariaLabel: el.getAttribute("aria-label"),
            text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120) || null,
        };
    });
}

/**
 * Presses `Tab` (or `Shift+Tab` if `reverse`) up to `maxSteps` times,
 * returning the FocusedElementInfo at each step. Useful for asserting tab
 * order, counting reachable elements, or proving a focus trap.
 */
export async function walkTab(
    page: Page,
    maxSteps: number,
    reverse = false,
): Promise<FocusedElementInfo[]> {
    const key = reverse ? "Shift+Tab" : "Tab";
    const trail: FocusedElementInfo[] = [];
    for (let i = 0; i < maxSteps; i++) {
        await page.keyboard.press(key);
        trail.push(await getFocusedInfo(page));
    }
    return trail;
}

/**
 * Presses Tab repeatedly until `predicate` matches the focused element,
 * up to `maxSteps`. Returns the matching info, or null if not found.
 */
export async function tabUntil(
    page: Page,
    predicate: (info: FocusedElementInfo) => boolean,
    maxSteps = 50,
): Promise<FocusedElementInfo | null> {
    for (let i = 0; i < maxSteps; i++) {
        await page.keyboard.press("Tab");
        const info = await getFocusedInfo(page);
        if (predicate(info)) return info;
    }
    return null;
}

/**
 * Tabs `steps` times, returning true iff every focused element matched
 * `predicate`. Used for focus-trap assertions: "after N Tabs, focus is
 * still inside selector X".
 */
export async function assertFocusRemainsIn(
    page: Page,
    predicate: (info: FocusedElementInfo) => boolean,
    steps: number,
    reverse = false,
): Promise<{ ok: boolean; trail: FocusedElementInfo[] }> {
    const trail = await walkTab(page, steps, reverse);
    return { ok: trail.every(predicate), trail };
}

/**
 * Counts the number of distinct tab stops by Tab-cycling until the focused
 * element repeats (the start of a focus trap loop) or maxSteps elapses.
 * Returns the count of unique focused elements observed.
 */
export async function countTabStops(page: Page, maxSteps = 50): Promise<number> {
    const seen = new Set<string>();
    for (let i = 0; i < maxSteps; i++) {
        await page.keyboard.press("Tab");
        const info = await getFocusedInfo(page);
        const key = `${info.tagName}|${info.id || ""}|${info.ariaLabel || ""}|${(info.text || "").slice(0, 40)}`;
        if (seen.has(key)) return seen.size;
        seen.add(key);
    }
    return seen.size;
}
