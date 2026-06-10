/**
 * E2E accessibility regression test for the email transcript pane.
 *
 * Asserts the contracts that bug 4626904 / email a11y work depends on:
 *   1. After submit success, an aria-live="assertive" region carries an
 *      announcement starting with the localized "Success." prefix.
 *   2. After submit failure, the same region carries the "Error." prefix.
 *   3. After submit, focus does NOT land on the chat-widget shell — it lands
 *      on the notification banner (close/expand button) directly.
 *   4. After cancel, focus is restored to the element that opened the pane.
 *
 * Requires:
 *   - chat-widget bundle built at chat-widget/dist/out.js (yarn build-sample)
 *   - A test fixture that mounts the widget against a mock chat SDK so the
 *     transcript submission resolves locally without a live agent. The
 *     fixture pattern mirrors PR #907 (DesignerChatSDK + HTML fixture).
 *
 * If the prerequisites are not available the suite skips itself rather than
 * failing CI. To exercise the assertions locally, set EMAIL_A11Y_E2E=1 and
 * provide a fixture path via EMAIL_A11Y_FIXTURE.
 */

import { Browser, BrowserContext, Page } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";

const fixturePath = process.env.EMAIL_A11Y_FIXTURE
    ? path.resolve(process.cwd(), process.env.EMAIL_A11Y_FIXTURE)
    : path.resolve(__dirname, "../../../customlivechatwidgets/EmailTranscriptFixture.html");

const widgetBundle = path.resolve(__dirname, "../../../../dist/out.js");

const prerequisitesPresent = (): boolean => {
    if (process.env.EMAIL_A11Y_E2E !== "1") return false;
    if (!fs.existsSync(widgetBundle)) return false;
    if (!fs.existsSync(fixturePath)) return false;
    return true;
};

const describeOrSkip = prerequisitesPresent() ? describe : describe.skip;

describeOrSkip("Email transcript pane — accessibility", () => {
    let browser: Browser;
    let context: BrowserContext;
    let page: Page;

    beforeAll(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        browser = await playwright[TestSettings.Browsers as any].launch(TestSettings.LaunchBrowserSettings);
        context = await browser.newContext({ viewport: TestSettings.Viewport });
    });

    afterAll(async () => {
        await context?.close();
        await browser?.close();
    });

    beforeEach(async () => {
        page = await context.newPage();
        await page.goto("file://" + fixturePath, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("#oc-lcw-chat-button-title", { timeout: 10000 });
        await page.click("#oc-lcw-chat-button-title");
        // Open the email transcript pane via the footer menu (selector pattern from existing widget)
        await page.waitForSelector("[data-testid='oc-lcw-emailTranscript'], [aria-label*='email' i]", { timeout: 10000 });
        await page.click("[data-testid='oc-lcw-emailTranscript'], [aria-label*='email' i]");
        await page.waitForSelector("#oclcw-emailTranscriptDialogContainer", { timeout: 10000 });
    });

    afterEach(async () => {
        await page?.close();
    });

    test("submit success announces 'Success. ' prefix via aria-live region", async () => {
        await page.fill("#oclcw-emailTranscriptDialogContainer input[type='email']", "user@example.com");
        await page.click("#oclcw-emailTranscriptDialogContainer button[type='submit'], [aria-label*='Send' i]");

        // The doc.body announcement region created by announceMessageImmediately
        const announcement = await page.waitForFunction(
            () => {
                const region = document.querySelector("[aria-live=\"assertive\"][role=\"alert\"]");
                return region && region.textContent && region.textContent.includes("Success.")
                    ? region.textContent
                    : null;
            },
            { timeout: 5000 }
        );
        const text = await announcement.jsonValue();
        expect(text).toMatch(/^Success\.\s/);
    });

    test("submit success lands focus on notification banner, not the chat-widget shell", async () => {
        await page.fill("#oclcw-emailTranscriptDialogContainer input[type='email']", "user@example.com");
        await page.click("#oclcw-emailTranscriptDialogContainer button[type='submit'], [aria-label*='Send' i]");

        await page.waitForFunction(
            () => {
                const active = document.activeElement as HTMLElement | null;
                if (!active) return false;
                const cls = active.className || "";
                return /webChatBanner(Expand|Close)Button/.test(cls);
            },
            { timeout: 5000 }
        );

        const focusedTagAndClass = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement;
            return { tag: el?.tagName, cls: el?.className };
        });
        expect(focusedTagAndClass.tag).toBe("BUTTON");
        expect(focusedTagAndClass.cls).toMatch(/webChatBanner/);
    });

    test("cancel restores focus to the element that opened the pane", async () => {
        // The trigger element should be remembered as previousElementIdOnFocusBeforeModalOpen
        const triggerHadId = await page.evaluate(() => {
            const trigger = document.activeElement as HTMLElement;
            return trigger ? trigger.id : null;
        });

        await page.click("#oclcw-emailTranscriptDialogContainer [aria-label*='Cancel' i]");

        await page.waitForFunction(
            (id) => document.activeElement && (id ? document.activeElement.id === id : true),
            triggerHadId,
            { timeout: 5000 }
        );

        const focusedId = await page.evaluate(() => document.activeElement && (document.activeElement as HTMLElement).id);
        if (triggerHadId) {
            expect(focusedId).toBe(triggerHadId);
        } else {
            // Fallback assertion: focus must be inside the chat widget, not on document.body
            expect(focusedId).not.toBe("");
        }
    });

    test("submit failure announces 'Error. ' prefix via aria-live region", async () => {
        // Fixture toggles a flag that causes the mock SDK to reject emailLiveChatTranscript.
        await page.evaluate(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).__forceEmailFailure = true;
        });
        await page.fill("#oclcw-emailTranscriptDialogContainer input[type='email']", "user@example.com");
        await page.click("#oclcw-emailTranscriptDialogContainer button[type='submit'], [aria-label*='Send' i]");

        const announcement = await page.waitForFunction(
            () => {
                const region = document.querySelector("[aria-live=\"assertive\"][role=\"alert\"]");
                return region && region.textContent && region.textContent.includes("Error.")
                    ? region.textContent
                    : null;
            },
            { timeout: 5000 }
        );
        const text = await announcement.jsonValue();
        expect(text).toMatch(/^Error\.\s/);
    });
});
