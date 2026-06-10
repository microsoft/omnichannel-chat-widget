import { Page } from "playwright";

/**
 * Snapshots ARIA live-region announcements during a test.
 *
 * Subscribes to mutations on `[aria-live]`, `[role=alert]`, and `[role=status]`
 * elements (and their subtrees) and accumulates the textContent observed at
 * each mutation. Test code can then assert that an expected announcement was
 * emitted.
 *
 * Usage:
 *   const observer = await observeLiveRegions(page);
 *   await ... // perform user action
 *   const announcements = await observer.snapshot();
 *   expect(announcements.some(a => a.includes("Success."))).toBe(true);
 *
 * Notes:
 *   - Both initial textContent and mutated textContent are captured.
 *   - `assertive` and `polite` regions are both observed; tests can filter by
 *     the optional region kind returned alongside each announcement.
 *   - Call `observer.dispose()` to detach (mostly for long-lived pages).
 */
export interface LiveRegionAnnouncement {
    text: string;
    kind: "assertive" | "polite" | "off" | "alert" | "status" | "unknown";
    at: number;
}

export interface LiveRegionObserver {
    snapshot(): Promise<LiveRegionAnnouncement[]>;
    waitFor(predicate: (a: LiveRegionAnnouncement) => boolean, timeoutMs?: number): Promise<LiveRegionAnnouncement>;
    dispose(): Promise<void>;
}

const INSTALL_SCRIPT = `
(function () {
    if (window.__a11yLiveObserver) {
        return;
    }
    const announcements = [];
    const kindOf = (el) => {
        const live = el.getAttribute && el.getAttribute("aria-live");
        if (live === "assertive" || live === "polite" || live === "off") return live;
        const role = el.getAttribute && el.getAttribute("role");
        if (role === "alert") return "alert";
        if (role === "status") return "status";
        return "unknown";
    };
    const isLiveNode = (el) => {
        if (!(el instanceof Element)) return false;
        if (el.hasAttribute("aria-live")) return true;
        const role = el.getAttribute("role");
        return role === "alert" || role === "status";
    };
    const findLiveAncestor = (el) => {
        let cur = el;
        while (cur && cur instanceof Element) {
            if (isLiveNode(cur)) return cur;
            cur = cur.parentElement;
        }
        return null;
    };
    const recordRegion = (region) => {
        const text = (region.textContent || "").replace(/\\s+/g, " ").trim();
        if (!text) return;
        announcements.push({ text, kind: kindOf(region), at: Date.now() });
    };
    // Snapshot initial state.
    document.querySelectorAll("[aria-live],[role=alert],[role=status]").forEach(recordRegion);
    const obs = new MutationObserver((records) => {
        const seen = new Set();
        for (const r of records) {
            const region = findLiveAncestor(r.target) ||
                (r.addedNodes && Array.from(r.addedNodes).map(findLiveAncestor).find(Boolean));
            if (region && !seen.has(region)) {
                seen.add(region);
                recordRegion(region);
            }
        }
    });
    obs.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["aria-live", "role"],
    });
    window.__a11yLiveObserver = { announcements, obs };
})();
`;

export async function observeLiveRegions(page: Page): Promise<LiveRegionObserver> {
    await page.evaluate(INSTALL_SCRIPT);

    const snapshot = async (): Promise<LiveRegionAnnouncement[]> => {
        return page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = window as any;
            return w.__a11yLiveObserver ? w.__a11yLiveObserver.announcements.slice() : [];
        });
    };

    const waitFor = async (
        predicate: (a: LiveRegionAnnouncement) => boolean,
        timeoutMs = 5000,
    ): Promise<LiveRegionAnnouncement> => {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const all = await snapshot();
            const match = all.find(predicate);
            if (match) return match;
            await page.waitForTimeout(50);
        }
        throw new Error(`live region announcement not observed within ${timeoutMs}ms`);
    };

    const dispose = async (): Promise<void> => {
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const w = window as any;
            if (w.__a11yLiveObserver) {
                w.__a11yLiveObserver.obs.disconnect();
                delete w.__a11yLiveObserver;
            }
        });
    };

    return { snapshot, waitFor, dispose };
}
