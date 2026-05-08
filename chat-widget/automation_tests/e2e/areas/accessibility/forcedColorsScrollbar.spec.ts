import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";
import { enableForcedColors, measureScrollbarWidth } from "../../utility/forcedColors";

const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
const describeIfBuilt = fs.existsSync(widgetBundlePath) ? describe : describe.skip;

/**
 * Regression catcher for forced-colors-scrollbar — In Windows High Contrast (forced-colors)
 * mode, the chat transcript scrollbar is invisible: the thumb has no painted
 * background-color so it disappears against the system background.
 *
 * `CHANGE_LOG.md` notes a prior fix landed for this; this catcher is a
 * regression GUARD that asserts the scrollbar still occupies non-zero width
 * with `forced-colors: active` emulated. A real verification pass requires
 * Windows High Contrast (Desert theme) — DOM proxy only here.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
describeIfBuilt("forced-colors scrollbar visibility (forced-colors-scrollbar regression guard)", () => {
    let newBrowser: Browser;
    let context: BrowserContext;
    let page: BasePage;

    beforeEach(async () => {
        newBrowser = await playwright[TestSettings.Browsers as any].launch(
            { ...TestSettings.LaunchBrowserSettings, channel: "msedge" }
        );
        context = await newBrowser.newContext({ viewport: TestSettings.Viewport });
    });

    afterEach(async () => {
        if (context) await context.close();
        if (newBrowser) await newBrowser.close();
    });

    test("transcript scrollbar should occupy non-zero width with forced-colors: active", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/AdaptiveCardChoiceSetWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        await enableForcedColors(page.Page);

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        // Wait for transcript so a scrollable surface exists.
        await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );
        await page.Page.waitForTimeout(2000);

        // Force overflow by sending a few synthetic large messages would be
        // ideal, but for a regression guard we just measure current state.
        const scrollbarWidth = await measureScrollbarWidth(page.Page, ".webchat__basic-transcript");

        // Regression guard: if the scrollbar is themed away to zero width in
        // forced-colors, it's invisible to users navigating with high-contrast
        // themes. We assert > 0 (not >= 0) so the test actually catches a
        // regression where the scrollbar collapses.
        expect(scrollbarWidth).toBeGreaterThan(0);
    });
});
