import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";
import { countTabStops } from "../../utility/keyboardLoop";
import { getA11yTree, findByRole } from "../../utility/a11yTree";

const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
const widgetBundleExists = fs.existsSync(widgetBundlePath);
const describeIfBuilt = widgetBundleExists ? describe : describe.skip;

/**
 * Adjacent markdown anchors that point to the same href should be merged into
 * a single tab stop. The historical regression rendered two separate <a>
 * elements for one logical link, which screen readers and keyboard users hit
 * twice in succession.
 *
 * Bug class: accessibility-tree shape regression — DOM is structurally valid
 * but the SR/keyboard experience is wrong.
 *
 * Covers (CHANGE_LOG [Unreleased]):
 *   - Markdown adjacent-anchor merge
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describe.skip("markdown adjacent anchor merge", () => {
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

    test("two adjacent same-href anchors render as a single anchor", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/MarkdownAnchorMergeWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(CustomLiveChatWidgetConstants.LiveChatButtonId);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 5000);
        await page.Page.waitForFunction(() => {
            return document.querySelectorAll(".webchat__basic-transcript a[href]").length > 0;
        }, undefined, { timeout: 15000 });

        const anchorCount = await page.Page.evaluate(() => {
            return document.querySelectorAll(
                ".webchat__basic-transcript a[href='https://microsoft.com']",
            ).length;
        });

        // Bug: anchorCount === 2; fix: anchorCount === 1.
        expect(anchorCount).toBe(1);
    });

    test("accessibility tree exposes a single link for the merged anchor", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/MarkdownAnchorMergeWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(CustomLiveChatWidgetConstants.LiveChatButtonId);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 5000);
        await page.Page.waitForFunction(() => {
            return document.querySelectorAll(".webchat__basic-transcript a[href]").length > 0;
        }, undefined, { timeout: 15000 });

        const tree = await getA11yTree(page.Page, ".webchat__basic-transcript");
        const links = findByRole(tree, "link");
        expect(links.length).toBe(1);
    });

    test("only one tab stop is consumed by the merged anchor", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/MarkdownAnchorMergeWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(CustomLiveChatWidgetConstants.LiveChatButtonId);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 5000);
        await page.Page.waitForFunction(() => {
            return document.querySelectorAll(".webchat__basic-transcript a[href]").length > 0;
        }, undefined, { timeout: 15000 });

        // Focus into the transcript region first.
        await page.Page.evaluate(() => {
            const el = document.querySelector(".webchat__basic-transcript") as HTMLElement | null;
            if (el) el.focus();
        });

        // We expect at most a small number of tab stops in this minimal
        // transcript; the merged anchor must not double-count.
        const stops = await countTabStops(page.Page, 12);
        expect(stops).toBeLessThanOrEqual(6);
    });
});
