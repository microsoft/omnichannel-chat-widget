import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";
import { findAll, getA11yTree } from "../../utility/a11yTree";

const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
// SKIPPED until the source fix lands. Un-skip to validate fix to AB#6003259.
// (Repro upgraded from the previous passing assertion to a deterministic catcher.)
const describeIfBuilt = describe.skip;

/**
 * Repro catcher for blank-announcements — Screen reader announces blank / hidden
 * irrelevant text (e.g. NVDA reads "blank" as it walks past empty live
 * regions, empty buttons, or unlabeled landmarks).
 *
 * The catcher walks the FULL accessibility tree (interestingOnly: false)
 * for the rendered chat widget and asserts that no "announceable" node
 * (button, link, textbox, checkbox, etc.) has an empty accessible name.
 * Roles like "generic" or "none" are excluded because they're typically
 * structural-only and screen readers skip them.
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
describeIfBuilt("blank announcements - empty accessible names (blank-announcements)", () => {
    let newBrowser: Browser;
    let context: BrowserContext;
    let page: BasePage;

    const ANNOUNCEABLE_ROLES = new Set([
        "button", "link", "textbox", "checkbox", "radio", "combobox",
        "menuitem", "tab", "switch", "option", "searchbox", "spinbutton",
        "slider", "treeitem"
    ]);

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

    test("no announceable a11y node should have an empty accessible name", async () => {
        page = new BasePage(await context.newPage());
        // Use a designer-mode widget that renders a real transcript (bot,
        // agent, user, link) so the WebChat surface, attachment surface,
        // and live regions are all instantiated. The prior FocusTrapWidget
        // mock did not exercise WebChat content where the bug actually lives.
        await page.openLiveChatWidget("customlivechatwidgets/BlankAnnouncementsWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();
        // Give WebChat enough time to render all mock messages.
        await page.Page.waitForTimeout(4000);

        const tree = await getA11yTree(page.Page, "#oc-lcw-container");
        const offenders = findAll(tree, (n: any) => {
            if (!n || !n.role) return false;
            if (!ANNOUNCEABLE_ROLES.has(n.role)) return false;
            const name = (n.name || "").trim();
            return name.length === 0;
        });

        // Additional check: aria-live regions (role="status" / "alert") that
        // ARE in the a11y tree but have an empty accessible name will be
        // announced as "blank" by NVDA when their content changes. They're
        // not in ANNOUNCEABLE_ROLES because they're rarely focusable, but
        // they are the textbook NVDA-"blank" source.
        const LIVE_ROLES = new Set(["status", "alert", "log", "timer"]);
        const liveOffenders = findAll(tree, (n: any) => {
            if (!n || !n.role) return false;
            if (!LIVE_ROLES.has(n.role)) return false;
            const name = (n.name || "").trim();
            return name.length === 0;
        });

        const allOffenders = [...offenders, ...liveOffenders];
        if (allOffenders.length > 0) {
            const summary = allOffenders.slice(0, 10).map((o: any) => ({ role: o.role, value: o.value, name: o.name }));
            // Write to a file so jest's stdout truncation doesn't hide them.
            try {
                fs.writeFileSync(
                    path.resolve(__dirname, "../../../reports/blankAnnouncements.offenders.json"),
                    JSON.stringify(summary, null, 2)
                );
            } catch { /* ignore */ }
            // eslint-disable-next-line no-console
            console.log("Blank-name offenders (first 10):", JSON.stringify(summary));
        }
        expect(allOffenders.length).toBe(0);
    });
});
