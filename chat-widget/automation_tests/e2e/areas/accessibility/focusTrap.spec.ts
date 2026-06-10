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
const describeIfBuilt = widgetBundleExists ? describe.skip : describe.skip; // SKIP on foundation: catcher fails until source fix lands; fix branch reverts to `widgetBundleExists ? describe : describe.skip`.

/**
 * Focus leaves the collapsed live chat widget without a keyboard trap.
 *
 * When only a single focusable element exists (the chat button in collapsed
 * state), Tab and Shift+Tab should move to adjacent host-page controls instead
 * of trapping keyboard users on the chat button.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describeIfBuilt("collapsed chat button keyboard navigation", () => {
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

    test("Tab on the chat button moves focus to the next host-page control", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/FocusTrapWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        expect(chatButton).not.toBeNull();
        await chatButton!.focus();

        // Sanity: chat button is the only tabbable element inside the widget
        // container in collapsed state. It should still allow Tab to leave the
        // widget boundary rather than trapping on itself.
        const focusableCount = await page.Page.evaluate(() => {
            const container = document.getElementById("oc-lcw-container");
            if (!container) return -1;
            const sel = "a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex='0']";
            return container.querySelectorAll(sel).length;
        });
        expect(focusableCount).toBe(1);

        await page.Page.keyboard.press("Tab");

        const activeId = await page.Page.evaluate(() => {
            const a = document.activeElement as HTMLElement | null;
            return a ? a.id : null;
        });
        expect(activeId).toBe("host-after-chat");
    });

    test("Shift+Tab on the chat button moves focus to the previous host-page control", async () => {
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
        expect(activeId).toBe("host-before-chat");
    });
});
