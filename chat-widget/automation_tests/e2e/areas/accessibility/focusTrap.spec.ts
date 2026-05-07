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
 * Focus escapes live chat widget when only one element is focusable.
 *
 * When only a single focusable element exists (the chat button in collapsed
 * state), Tab should keep focus trapped on that element instead of escaping
 * the widget boundary.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describeIfBuilt("focus trap - single focusable element", () => {
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

    test("chat button is visible and focusable", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/FocusTrapWidget.html");
        const visible = await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );
        expect(visible).toBe(true);
    });

    test("Tab on the chat button keeps focus on the chat button (single-focusable trap)", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/FocusTrapWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        expect(chatButton).not.toBeNull();
        await chatButton!.focus();

        // Sanity: chat button is the only tabbable element inside the widget
        // container in collapsed state. The fix in utils.ts attaches a keydown
        // handler so Tab calls preventDefault + re-focuses the same element.
        const focusableCount = await page.Page.evaluate(() => {
            const container = document.getElementById("oc-lcw-container");
            if (!container) return -1;
            const sel = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex='0']";
            return container.querySelectorAll(sel).length;
        });
        expect(focusableCount).toBe(1);

        await page.Page.keyboard.press("Tab");

        // Without the fix, default browser behaviour moves focus to the next
        // tabbable element on the page (or to <body> if none exists). The fix
        // pins focus on the same single-focusable element. Assert that the
        // chat button is *still* the active element.
        const activeId = await page.Page.evaluate(() => {
            const a = document.activeElement as HTMLElement | null;
            return a ? a.id : null;
        });
        expect(activeId).toBe(CustomLiveChatWidgetConstants.LiveChatButtonId.replace(/^#/, ""));
    });

    test("Shift+Tab on the chat button keeps focus on the chat button (single-focusable trap)", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/FocusTrapWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        expect(chatButton).not.toBeNull();
        await chatButton!.focus();

        await page.Page.keyboard.press("Shift+Tab");

        const activeId = await page.Page.evaluate(() => {
            const a = document.activeElement as HTMLElement | null;
            return a ? a.id : null;
        });
        expect(activeId).toBe(CustomLiveChatWidgetConstants.LiveChatButtonId.replace(/^#/, ""));
    });
});
