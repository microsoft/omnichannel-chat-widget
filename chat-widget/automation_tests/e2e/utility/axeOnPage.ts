import { Page } from "playwright";

/**
 * Runs @axe-core/playwright against the live (post-mount) widget page.
 *
 * Layer 1.5: catches issues that only appear once the widget has actually
 * mounted (webchat-rendered content, open panes, dynamic dialogs) which the
 * static Storybook scan does not see.
 *
 * Lazy-required so that tests can import this module even when the devDep
 * isn't present in a given install (gives a clearer error than a top-level
 * import failure).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RunAxeOptions {
    include?: string[];
    exclude?: string[];
    tags?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runAxe(page: Page, opts: RunAxeOptions = {}): Promise<any> {
    let AxeBuilder;
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        AxeBuilder = require("@axe-core/playwright").default;
    } catch (e) {
        throw new Error(
            "@axe-core/playwright is not installed. Run `yarn install` in chat-widget.",
        );
    }
    const builder = new AxeBuilder({ page });
    if (opts.tags && opts.tags.length) builder.withTags(opts.tags);
    if (opts.include && opts.include.length) {
        for (const sel of opts.include) builder.include(sel);
    }
    if (opts.exclude && opts.exclude.length) {
        for (const sel of opts.exclude) builder.exclude(sel);
    }
    return builder.analyze();
}

export function summarizeViolations(results: { violations: { id: string; impact: string | null }[] }): {
    total: number;
    byImpact: Record<string, number>;
    byRule: Record<string, number>;
} {
    const byImpact: Record<string, number> = {};
    const byRule: Record<string, number> = {};
    for (const v of results.violations || []) {
        const impact = v.impact || "minor";
        byImpact[impact] = (byImpact[impact] || 0) + 1;
        byRule[v.id] = (byRule[v.id] || 0) + 1;
    }
    return { total: (results.violations || []).length, byImpact, byRule };
}
