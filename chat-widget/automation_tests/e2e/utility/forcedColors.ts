import { Page } from "playwright";

/**
 * Helper for emulating Windows High Contrast / forced-colors mode in Chromium.
 *
 * Used by accessibility regression catchers (forced-colors-scrollbar) to assert that UI
 * affordances which depend on colour (e.g. the chat transcript scrollbar
 * thumb) remain visible when the browser exposes a forced-colors palette.
 *
 * Chromium accepts an `--force-colors` flag and Playwright also supports
 * `emulateMedia({ forcedColors: "active" })` since 1.21+. We use the latter
 * because it can be applied per-page after launch.
 */
export async function enableForcedColors(page: Page): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page as any).emulateMedia({ forcedColors: "active", colorScheme: "dark" });
}

export async function disableForcedColors(page: Page): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (page as any).emulateMedia({ forcedColors: "none" });
}

/**
 * Returns true if the element (or one of its scrollable ancestors) has a
 * non-zero rendered scrollbar thumb in forced-colors mode. We can't directly
 * inspect ::-webkit-scrollbar pseudo-elements via getComputedStyle, so we
 * proxy by checking that the scrollable element has overflow content and
 * a non-zero clientWidth - offsetWidth delta (i.e. native scrollbar took
 * width). Tests should assert > 0 to catch the "invisible scrollbar" regression.
 */
export async function measureScrollbarWidth(page: Page, selector: string): Promise<number> {
    return page.evaluate((sel: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return -1;
        // offsetWidth includes scrollbar; clientWidth does not. Difference is
        // the painted scrollbar thumb track width.
        return el.offsetWidth - el.clientWidth;
    }, selector);
}
