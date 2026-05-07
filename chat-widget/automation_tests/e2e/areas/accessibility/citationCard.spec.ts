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
describeIfBuilt("citation card accessibility", () => {
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
});
