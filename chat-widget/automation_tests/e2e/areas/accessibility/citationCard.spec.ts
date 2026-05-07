import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";

const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
const widgetBundleExists = fs.existsSync(widgetBundlePath);
const describeIfBuilt = widgetBundleExists ? describe : describe.skip;

/**
 * Citation cards / inline markdown citations should not expose `title`
 * attributes on descendants that screen readers will announce in addition to
 * the link name, and adjacent same-href anchors should be a single tab stop.
 *
 * Bug class: accessibility-tree shape regressions. Static axe does not catch
 * these — the DOM is technically valid but SR experience is poor.
 *
 * Covers (CHANGE_LOG [Unreleased]):
 *   - Citation card title attribute on descendants
 *   - Citation card single-link expectation
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe.skip("citation card accessibility", () => {
    let newBrowser: Browser;
    let context: BrowserContext;
    let page: BasePage;

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newBrowser = await playwright[TestSettings.Browsers as any].launch(
            { ...TestSettings.LaunchBrowserSettings, channel: "msedge" }
        );
        context = await newBrowser.newContext({ viewport: TestSettings.Viewport });
    });

    afterEach(async () => {
        if (context) await context.close();
        if (newBrowser) await newBrowser.close();
    });

    test("citation links do not expose title attribute to assistive tech", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/CitationCardWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(CustomLiveChatWidgetConstants.LiveChatButtonId);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 5000);
        // Wait until at least one rendered link is in the transcript.
        await page.Page.waitForFunction(() => {
            return document.querySelectorAll(".webchat__basic-transcript a[href]").length > 0;
        }, undefined, { timeout: 15000 });

        // None of the rendered citation links (or their descendants) should
        // carry a `title` attribute. Some renderers add `title=` for tooltips
        // which SR also reads, leading to duplicated announcements.
        const titledNodes = await page.Page.evaluate(() => {
            const out: { tag: string; title: string; href: string | null }[] = [];
            document.querySelectorAll(".webchat__basic-transcript a[href]").forEach(a => {
                const link = a as HTMLAnchorElement;
                if (link.hasAttribute("title")) {
                    out.push({ tag: "a", title: link.getAttribute("title") || "", href: link.getAttribute("href") });
                }
                link.querySelectorAll("[title]").forEach(d => {
                    out.push({
                        tag: (d as HTMLElement).tagName.toLowerCase(),
                        title: d.getAttribute("title") || "",
                        href: link.getAttribute("href"),
                    });
                });
            });
            return out;
        });

        expect(titledNodes).toEqual([]);
    });

    test("citation expressed as link is reachable as a single tab stop", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/CitationCardWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(CustomLiveChatWidgetConstants.LiveChatButtonId);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 5000);
        await page.Page.waitForFunction(() => {
            return document.querySelectorAll(".webchat__basic-transcript a[href]").length >= 2;
        }, undefined, { timeout: 15000 });

        // Each citation href should appear exactly once in the transcript;
        // duplicate <a> elements with the same href indicate the
        // markdown/citation renderer is emitting redundant tab stops.
        const hrefCounts = await page.Page.evaluate(() => {
            const counts: Record<string, number> = {};
            document.querySelectorAll(".webchat__basic-transcript a[href]").forEach(a => {
                const h = a.getAttribute("href") || "";
                counts[h] = (counts[h] || 0) + 1;
            });
            return counts;
        });

        for (const [href, count] of Object.entries(hrefCounts)) {
            expect({ href, count }).toEqual({ href, count: 1 });
        }
    });

    // Tightened catcher: injects a citation-card-shaped anchor (the structure
    // WebChat's LinkDefinitionItem renders) into the transcript and verifies
    // the runtime a11y patch (`patchCitationAnchorsForA11y` / MutationObserver
    // wired in WebChatContainerStateful) applied the fix-artifacts:
    //   - combined aria-label on the anchor ("1, <title>")
    //   - all descendants aria-hidden=true, tabindex=-1, role=presentation
    //   - any descendant title attribute moved to data-ocw-original-title
    // On unfixed source the patch never runs, so the artifacts are absent.
    test("injected citation-card anchor is patched into a single accessible link", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/CitationCardWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(CustomLiveChatWidgetConstants.LiveChatButtonId);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 5000);
        await page.Page.waitForFunction(() => {
            return !!document.querySelector(".webchat__basic-transcript");
        }, undefined, { timeout: 15000 });

        // Inject a citation-card-shaped anchor mirroring WebChat's
        // LinkDefinitionItem output. Both class hooks the patch listens for
        // are exercised so this test fails consistently regardless of which
        // selector branch the fix uses.
        await page.Page.evaluate(() => {
            const transcript = document.querySelector(".webchat__basic-transcript");
            if (!transcript) {
                return;
            }
            const wrapper = document.createElement("div");
            wrapper.setAttribute("data-test-injected-citation", "true");
            wrapper.innerHTML = `
                <a class="webchat__link-definitions__list-item-box" href="https://example.com/citation"
                   data-test-citation="1">
                    <div class="webchat__link-definitions__list-item-badge">1</div>
                    <div class="webchat__link-definitions__list-item-text" title="Example Citation Title">Example Citation Title</div>
                </a>
                <a href="cite:second-citation" data-test-citation="2">
                    <div>2</div>
                    <div title="Second Citation">Second Citation</div>
                </a>
            `;
            transcript.appendChild(wrapper);
        });

        // Give the MutationObserver a tick to apply the patch.
        await page.Page.waitForTimeout(500);

        const result = await page.Page.evaluate(() => {
            const out: Array<{
                idx: string;
                ariaLabel: string | null;
                descendantsHidden: boolean;
                descendantsHaveTitle: boolean;
            }> = [];
            document.querySelectorAll("a[data-test-citation]").forEach(anchor => {
                const a = anchor as HTMLAnchorElement;
                const descendants = Array.from(a.querySelectorAll("*"));
                out.push({
                    idx: a.getAttribute("data-test-citation") || "",
                    ariaLabel: a.getAttribute("aria-label"),
                    descendantsHidden: descendants.length > 0
                        && descendants.every(d => d.getAttribute("aria-hidden") === "true"),
                    descendantsHaveTitle: descendants.some(d => d.hasAttribute("title")),
                });
            });
            return out;
        });

        expect(result.length).toBeGreaterThanOrEqual(2);
        for (const entry of result) {
            // Fix-artifact 1: anchor carries a combined aria-label.
            expect({ idx: entry.idx, hasAriaLabel: entry.ariaLabel != null && entry.ariaLabel.length > 0 })
                .toEqual({ idx: entry.idx, hasAriaLabel: true });
            // Fix-artifact 2: every descendant is hidden from the a11y tree.
            expect({ idx: entry.idx, descendantsHidden: entry.descendantsHidden })
                .toEqual({ idx: entry.idx, descendantsHidden: true });
            // Fix-artifact 3: title attributes are stripped from descendants.
            expect({ idx: entry.idx, descendantsHaveTitle: entry.descendantsHaveTitle })
                .toEqual({ idx: entry.idx, descendantsHaveTitle: false });
        }
    });
});
