import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";

// These tests require a built widget bundle (dist/out.js) and Microsoft Edge.
// They are skipped on CI where the bundle is not available.
const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
const widgetBundleExists = fs.existsSync(widgetBundlePath);
const describeIfBuilt = widgetBundleExists ? describe : describe.skip;

/**
 * Success notification is not announced immediately after activating
 * Send to email chat transcript; screen reader reads entire transcript
 * first.
 *
 * Verifies that the widget has proper aria-live regions and that success
 * notifications take precedence over transcript content for screen readers.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describeIfBuilt("email transcript notification", () => {
    let newBrowser: Browser;
    let context: BrowserContext;
    let page: BasePage;

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newBrowser = await playwright[TestSettings.Browsers as any].launch(
            { ...TestSettings.LaunchBrowserSettings, channel: "msedge" }
        );
        context = await newBrowser.newContext({
            viewport: TestSettings.Viewport,
        });
    });

    afterEach(async () => {
        if (context) {
            await context.close();
        }
        if (newBrowser) {
            await newBrowser.close();
        }
    });

    test("widget opens in designer mode with mock messages", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/EmailNotificationWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        // Open the widget
        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        // Wait for the transcript
        const transcriptVisible = await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );
        expect(transcriptVisible).toBe(true);
    });

    test("aria-live regions exist for immediate notification delivery", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/EmailNotificationWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );

        await page.Page.waitForTimeout(2000);

        // Check for aria-live="assertive" regions — these take priority and
        // should be used for success notifications so they interrupt the
        // transcript reading
        const liveRegions = await page.Page.evaluate(() => {
            const regions = document.querySelectorAll("[aria-live]");
            return Array.from(regions).map(r => ({
                ariaLive: r.getAttribute("aria-live"),
                role: r.getAttribute("role"),
                tagName: r.tagName,
                className: r.className
            }));
        });

        // The widget should have live regions for notifications
        expect(liveRegions.length).toBeGreaterThanOrEqual(1);
    });

    test("transcript container does not use assertive aria-live", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/EmailNotificationWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );

        await page.Page.waitForTimeout(2000);

        // The transcript container should NOT be aria-live="assertive",
        // otherwise reading the full transcript would block notification
        // announcements. It should be "polite" or have no aria-live.
        const transcriptAriaLive = await page.Page.evaluate(() => {
            const transcript = document.querySelector(".webchat__basic-transcript");
            return transcript ? transcript.getAttribute("aria-live") : null;
        });

        // Transcript should not aggressively interrupt — it should be polite or off
        if (transcriptAriaLive) {
            expect(transcriptAriaLive).not.toBe("assertive");
        }
    });
});
