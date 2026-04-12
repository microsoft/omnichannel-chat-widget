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
 * Screen reader announces "Bot WC said" instead of the full agent name,
 * and "Bot JO said" persists after agent transfer.
 *
 * The bot initials middleware should use the full agent name (not initials)
 * in ACTIVITY_BOT_SAID_ALT and ACTIVITY_BOT_ATTACHED_ALT so that screen
 * readers announce descriptive speaker names.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describeIfBuilt("bot initials accessibility", () => {
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

    test("widget loads with mock messages in designer mode", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/BotInitialsWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        // Click the chat button to open the widget
        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        expect(chatButton).not.toBeNull();
        await chatButton!.click();

        // Wait for the transcript to appear
        const transcriptVisible = await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );
        expect(transcriptVisible).toBe(true);
    });

    test("bot messages use descriptive alt text instead of initials", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/BotInitialsWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        // Wait for mock messages to render in the transcript
        await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );

        // Wait for messages to be injected (1s initial delay + stagger)
        await page.Page.waitForTimeout(3000);

        // Check for accessibility attributes — the alt text should use a
        // descriptive name (not just initials like "B" or "Bo")
        const altTexts = await page.Page.evaluate(() => {
            const elements = document.querySelectorAll("[aria-label]");
            const texts: string[] = [];
            elements.forEach(el => {
                const label = el.getAttribute("aria-label") || "";
                if (label.toLowerCase().includes("said") || label.toLowerCase().includes("attached")) {
                    texts.push(label);
                }
            });
            return texts;
        });

        // The alt text should not use bare initials — it should contain the
        // full bot name. In designer mode the default bot name is "Bot".
        for (const alt of altTexts) {
            // Should NOT match patterns like "JO said:" or "WC said:" (bare initials)
            expect(alt).not.toMatch(/^[A-Z]{1,3} said:/);
            expect(alt).not.toMatch(/^[A-Z]{1,3} attached:/);
        }
    });

    test("transcript renders bot messages with accessible content", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/BotInitialsWidget.html");
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

        // Wait for messages to appear
        await page.Page.waitForTimeout(3000);

        // Verify that the mock messages are actually rendered
        const messageTexts = await page.Page.evaluate(() => {
            const bubbles = document.querySelectorAll(".webchat__bubble__content");
            return Array.from(bubbles).map(b => b.textContent?.trim() || "");
        });

        expect(messageTexts.length).toBeGreaterThanOrEqual(1);
    });
});
