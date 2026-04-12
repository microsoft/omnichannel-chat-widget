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
 * Incorrect list item count announced for radio button group.
 *
 * When an adaptive card with a radio button group is rendered, the screen
 * reader should announce the correct number of options. The fixture uses
 * an Input.ChoiceSet with 3 choices (Monthly, Weekly, Day Pass).
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
describeIfBuilt("adaptive card radio button count", () => {
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

    test("adaptive card renders with the correct number of radio options", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/AdaptiveCardChoiceSetWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        // Open the widget
        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();

        // Wait for the transcript
        await page.waitUntilLiveChatSelectorIsVisible(
            ".webchat__basic-transcript",
            5,
            undefined,
            5000
        );

        // Wait for adaptive card to render (1s initial delay + rendering)
        await page.Page.waitForTimeout(4000);

        // Find radio inputs inside the adaptive card
        const radioCount = await page.Page.evaluate(() => {
            const radios = document.querySelectorAll("input[type='radio']");
            return radios.length;
        });

        // The fixture defines exactly 3 choices
        expect(radioCount).toBe(3);
    });

    test("radio buttons have correct accessible labels", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/AdaptiveCardChoiceSetWidget.html");
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

        await page.Page.waitForTimeout(4000);

        // Check that each radio has an accessible label
        const radioLabels = await page.Page.evaluate(() => {
            const radios = document.querySelectorAll("input[type='radio']");
            return Array.from(radios).map(radio => {
                const id = radio.getAttribute("id");
                const label = id
                    ? document.querySelector(`label[for="${id}"]`)?.textContent?.trim()
                    : null;
                const ariaLabel = radio.getAttribute("aria-label");
                return label || ariaLabel || null;
            });
        });

        expect(radioLabels).toContain("Monthly Pass");
        expect(radioLabels).toContain("Weekly Pass");
        expect(radioLabels).toContain("Day Pass");
    });

    test("radio group conveys correct option count to accessibility tree", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/AdaptiveCardChoiceSetWidget.html");
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

        await page.Page.waitForTimeout(4000);

        // Use Playwright's accessibility tree to check radio group
        const snapshot = await page.Page.accessibility.snapshot();

        // Find radio buttons in the accessibility tree
        const findRadios = (node: any): any[] => {
            const results: any[] = [];
            if (node.role === "radio") {
                results.push(node);
            }
            if (node.children) {
                for (const child of node.children) {
                    results.push(...findRadios(child));
                }
            }
            return results;
        };

        const radios = snapshot ? findRadios(snapshot) : [];
        expect(radios.length).toBe(3);
    });
});
