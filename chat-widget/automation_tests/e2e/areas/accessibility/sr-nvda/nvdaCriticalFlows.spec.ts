import * as fs from "fs";
import * as path from "path";
import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import { TestSettings } from "../../../../configuration/test-settings";
import { BasePage } from "../../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";
import { expectAnnouncedEvent, loadGuidepup } from "../../../utility/srAssert";

/**
 * Layer 3 desktop-NVDA spec sweep — 10 high-traffic flows.
 *
 * Skip conditions (any one suffices):
 *   - not running on win32
 *   - dist/out.js missing
 *   - @guidepup/guidepup not installed
 *   - NVDA not installed (best-effort check via NVDA_PATH env or default install path)
 *
 * In CI these run on a Windows runner via setupNvda.ps1; locally, follow
 * docs/accessibility/NVDA_SETUP.md.
 *
 * Each spec is intentionally minimal: open the widget, drive the flow with the
 * keyboard, assert NVDA spoke the canonical phrase from nvda-phrases.json.
 * The harness owns phrase mapping; specs name only abstract events.
 */
const widgetBundlePath = path.resolve(__dirname, "../../../../../dist/out.js");
const widgetBundleExists = fs.existsSync(widgetBundlePath);

const defaultNvdaInstalled =
    process.platform === "win32" &&
    (process.env.NVDA_PATH
        ? fs.existsSync(process.env.NVDA_PATH)
        : fs.existsSync("C:\\Program Files (x86)\\NVDA\\nvda.exe"));

let guidepupAvailable = false;
try {
    require.resolve("@guidepup/guidepup");
    guidepupAvailable = true;
} catch {
    guidepupAvailable = false;
}

const shouldRun = widgetBundleExists && defaultNvdaInstalled && guidepupAvailable;
const describeIfNvda = shouldRun ? describe : describe.skip;

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
describeIfNvda("Layer 3 desktop NVDA — critical flows", () => {
    let newBrowser: Browser;
    let context: BrowserContext;
    let page: BasePage;
    let sr: any;

    beforeAll(async () => {
        const guidepup = loadGuidepup();
        sr = guidepup.nvda;
        await sr.start();
    });

    afterAll(async () => {
        if (sr) await sr.stop();
    });

    beforeEach(async () => {
        newBrowser = await playwright[TestSettings.Browsers as any].launch(
            { ...TestSettings.LaunchBrowserSettings, channel: "msedge" }
        );
        context = await newBrowser.newContext({ viewport: TestSettings.Viewport });
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget("customlivechatwidgets/KeyboardFlowsWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );
    });

    afterEach(async () => {
        if (context) await context.close();
        if (newBrowser) await newBrowser.close();
    });

    async function openChat() {
        const button = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await button!.focus();
        await page.Page.keyboard.press("Enter");
        await page.waitUntilLiveChatSelectorIsVisible(".webchat__basic-transcript", 5, undefined, 8000);
    }

    test("chat button focus announces 'Chat, button'", async () => {
        const button = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await button!.focus();
        await expectAnnouncedEvent(sr, "chatButtonFocused");
    });

    test("opening start-chat pane announces start-chat header", async () => {
        await openChat();
        await expectAnnouncedEvent(sr, "startChatPaneOpened");
    });

    test("sending a message announces 'message sent'", async () => {
        await openChat();
        await page.Page.keyboard.type("hello");
        await page.Page.keyboard.press("Enter");
        await expectAnnouncedEvent(sr, "messageSent");
    });

    test("receiving a bot message announces 'said ...'", async () => {
        await openChat();
        // designer mode delivers mockMessages on open
        await expectAnnouncedEvent(sr, "messageReceived", 8000);
    });

    test("agent typing announces 'is typing'", async () => {
        await openChat();
        await expectAnnouncedEvent(sr, "agentTyping", 8000);
    });

    test("attachment sent announces 'attachment sent'", async () => {
        await openChat();
        // Designer mode may not trigger attachment flow; this asserts the
        // phrase mapping is present even if the trigger is platform-specific.
        await expectAnnouncedEvent(sr, "attachmentSent", 4000).catch(() => {
            // surfaced as test failure only when widget actually emits the event;
            // promise rejection here means the flow didn't trigger in designer mode.
            // Mark explicitly as a known harness gap.
            throw new Error("attachmentSent NVDA phrase not heard — widget did not trigger upload-complete in designer mode");
        });
    });

    test("transcript success announces 'email sent'", async () => {
        await openChat();
        await expectAnnouncedEvent(sr, "transcriptSuccess", 4000).catch(() => {
            throw new Error("transcriptSuccess NVDA phrase not heard — designer mode did not surface transcript success path");
        });
    });

    test("transcript error announces 'could not send email'", async () => {
        await openChat();
        await expectAnnouncedEvent(sr, "transcriptError", 4000).catch(() => {
            throw new Error("transcriptError NVDA phrase not heard — designer mode did not surface transcript error path");
        });
    });

    test("end-chat confirm dialog announces 'end chat'", async () => {
        await openChat();
        await page.Page.keyboard.press("Escape");
        await expectAnnouncedEvent(sr, "endChatConfirm", 4000).catch(() => {
            throw new Error("endChatConfirm NVDA phrase not heard — Esc did not open end-chat confirm in designer mode");
        });
    });

    test("reconnect prompt announces 'reconnect'", async () => {
        await openChat();
        await expectAnnouncedEvent(sr, "reconnectPrompt", 4000).catch(() => {
            throw new Error("reconnectPrompt NVDA phrase not heard — designer mode did not trigger reconnect");
        });
    });
});
