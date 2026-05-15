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
 * Repro catcher for focus-trap-after-reload (internal tracking) — After the user
 * activates a link inside an open chat and the page reloads (persistent
 * storage rehydrates the widget into the open state), focus is "trapped"
 * inside the widget with no escape via Tab.
 *
 * Trigger condition discovered: the bug surfaces when a modal pane
 * (Confirmation / Citation / EmailTranscript) is OPEN at reload time.
 * The pane's `preventFocusToMoveOutOfElement` focus-trap effect
 * re-installs on rehydrate, but the surrounding rehydrate flow leaves
 * focus / Tab handlers in a state where Tab from the host page cannot
 * traverse out of the widget.
 *
 * Sequence:
 *   1. Open the widget so a transcript renders.
 *   2. Click an in-chat link (preventDefault'd so no nav).
 *   3. Click the header close ("X") button → opens the close-chat
 *      confirmation pane → installs a focus trap.
 *   4. Reload the page.
 *   5. Drive focus to a host-page button BEFORE the widget, then
 *      press Tab up to 60 times. Assert focus reaches the host-page
 *      button AFTER the widget.
 *
 * Today the catcher FAILS deterministically: Tab never reaches the
 * post-widget button — focus is trapped inside the rehydrated widget.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
describeIfBuilt("focus trap after page reload (focus-trap-after-reload)", () => {
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

    test("after link activation + page reload, Tab from page should still reach controls outside the widget", async () => {
        page = new BasePage(await context.newPage());
        // Use a widget mock that renders a real message containing a link AND
        // exposes host-page buttons before/after the widget so we can walk
        // the Tab order to prove focus isn't trapped inside the rehydrated
        // widget.
        await page.openLiveChatWidget("customlivechatwidgets/FocusTrapAfterLinkWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        // Open the widget and wait for the transcript to render.
        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();
        await page.Page.waitForTimeout(3000);

        // Intercept the link click so it doesn't navigate. The bug
        // surfaces from the *activation* + reload sequence, not from
        // actual navigation.
        await page.Page.evaluate(() => {
            document.querySelectorAll<HTMLAnchorElement>("a[href]").forEach(a => {
                a.addEventListener("click", e => e.preventDefault(), true);
            });
        });

        const links = await page.Page.$$("#oc-lcw-container a[href]");
        if (links.length > 0) {
            await links[0].click();
            await page.Page.waitForTimeout(500);
        }

        // Trigger the close-chat confirmation pane so a focus trap is live
        // across the reload. This is the production scenario that the
        // designer-mode mock could not otherwise reproduce: a modal pane
        // open at reload time forces the rehydrate path to re-install
        // its `preventFocusToMoveOutOfElement` trap.
        const closeBtn = await page.Page.$("#lcw-header-close-button");
        if (closeBtn) {
            await closeBtn.click();
            await page.Page.waitForTimeout(800);
        }

        // Reload — persistent storage should rehydrate widget state.
        await page.Page.reload({ waitUntil: "domcontentloaded" });
        await page.Page.waitForTimeout(2500);

        // Precondition: widget rehydrated to the open state. If this fails,
        // the catcher cannot exercise the bug scenario (no modal pane = no
        // focus trap to leak). Hard-fail here so a missed rehydration cannot
        // produce a false green.
        const widgetOpen = await page.Page.evaluate(() => {
            return !!document.querySelector("#oc-lcw-container [role='log']")
                || !!document.querySelector("#oc-lcw-container .webchat__basic-transcript");
        });
        expect(widgetOpen).toBe(true);

        // Drive focus to the page's host-before-chat button, then Tab
        // forward through the widget. If focus is trapped inside the
        // rehydrated widget, Tab will NEVER land on host-after-chat.
        await page.Page.focus("#host-before-chat");
        let landedOnAfter = false;
        for (let i = 0; i < 60; i++) {
            await page.Page.keyboard.press("Tab");
            const id = await page.Page.evaluate(() =>
                (document.activeElement as HTMLElement | null)?.id || "");
            if (id === "host-after-chat") { landedOnAfter = true; break; }
        }

        if (!landedOnAfter) {
            // eslint-disable-next-line no-console
            console.log("Focus never reached host-after-chat after reload (widget rehydrated open).");
        }
        expect(landedOnAfter).toBe(true);
    });
});
