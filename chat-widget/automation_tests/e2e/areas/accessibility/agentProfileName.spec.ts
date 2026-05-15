import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";

const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
const describeIfBuilt = fs.existsSync(widgetBundlePath) ? describe : describe.skip;

/**
 * Repro / catcher for internal tracking — NVDA does NOT read the agent's profile
 * name when navigating to messages sent by the agent.
 *
 * The bot-initials middleware (PR #907) updates ACTIVITY_BOT_SAID_ALT from the
 * incoming activity's `from.name`. WebChat then renders that string into a
 * visually-hidden `ScreenReaderText` element inside the message group's
 * `role="group"` container, which screen readers announce when the user
 * navigates onto each message.
 *
 * Catcher: load a designer-mode widget whose mock messages have
 * `from.role: "agent"` and a known agent display name ("Sara Smith"),
 * open the chat, and assert that:
 *   1. At least one `[role='group']` exists in the transcript.
 *   2. Every group that contains a "said:" / "attached:" SR fragment
 *      includes the agent's profile name (not the avatar initials).
 *   3. No group's SR fragment matches the bare-initials pattern
 *      (e.g. "SS said:") that the original bug reported as the offender.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
describeIfBuilt("agent profile name accessibility (internal tracking)", () => {
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

    test("agent messages must include the agent's profile name in screen-reader text", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/AgentProfileNameWidget.html");
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

        // Wait until WebChat has rendered the role="group" wrappers with their
        // ScreenReaderText "X said:" prefixes.
        await page.Page.waitForFunction(() => {
            const groups = document.querySelectorAll("[role='group']");
            return Array.from(groups).some((g) => {
                const text = (g.textContent || "").toLowerCase();
                return text.includes("said") || text.includes("attached");
            });
        }, undefined, { timeout: 15000 });

        const srTexts = await page.Page.evaluate(() => {
            const groups = document.querySelectorAll("[role='group']");
            const out: string[] = [];
            groups.forEach((g) => {
                const text = (g.textContent || "").trim();
                if (text.toLowerCase().includes("said") || text.toLowerCase().includes("attached")) {
                    const srText = g.firstElementChild?.textContent?.trim() || text;
                    out.push(srText);
                }
            });
            return out;
        });

        expect(srTexts.length).toBeGreaterThan(0);
        for (const sr of srTexts) {
            // Must NOT be bare initials like "SS said:" — that's the original
            // 2022 bug. Must contain the agent's actual display name.
            expect(sr).not.toMatch(/^[A-Z]{1,3} said:/);
            expect(sr).not.toMatch(/^[A-Z]{1,3} attached:/);
            expect(sr).toContain("Sara Smith");
        }
    });
});
