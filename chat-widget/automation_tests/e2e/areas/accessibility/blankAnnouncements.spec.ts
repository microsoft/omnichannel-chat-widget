import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import * as fs from "fs";
import * as path from "path";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";
import { findAll, getA11yTree } from "../../utility/a11yTree";

const widgetBundlePath = path.resolve(__dirname, "../../../../dist/out.js");
const describeIfBuilt = fs.existsSync(widgetBundlePath) ? describe : describe.skip;

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
        await page.openLiveChatWidget("customlivechatwidgets/FocusTrapWidget.html");
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );

        // Open the widget so prechat / loading / chat surfaces render.
        const chatButton = await page.Page.$(CustomLiveChatWidgetConstants.LiveChatButtonId);
        await chatButton!.click();
        await page.Page.waitForTimeout(2500);

        const tree = await getA11yTree(page.Page, "#oc-lcw-container");
        const offenders = findAll(tree, (n: any) => {
            if (!n || !n.role) return false;
            if (!ANNOUNCEABLE_ROLES.has(n.role)) return false;
            const name = (n.name || "").trim();
            return name.length === 0;
        });

        if (offenders.length > 0) {
            // Surface the first few for debugging.
            // eslint-disable-next-line no-console
            console.log("Empty-name offenders (first 5):",
                offenders.slice(0, 5).map((o: any) => ({ role: o.role, value: o.value })));
        }
        expect(offenders.length).toBe(0);
    });
});
