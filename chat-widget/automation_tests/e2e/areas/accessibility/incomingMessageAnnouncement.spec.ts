import { chromium } from "playwright";
import type { Browser, Page } from "playwright";
import * as path from "path";
import { pathToFileURL } from "url";

interface Announcement {
    text: string;
    hidden: boolean;
    insideDialog: boolean;
}

type AnnouncementWindow = typeof window & {
    receiveMessage(id: string, text: string, role: string, attachments?: unknown[]): Promise<void>;
    announcements: Announcement[];
};

describe("incoming message announcements", () => {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await chromium.launch({ channel: "msedge", headless: true });
    });

    beforeEach(async () => {
        page = await browser.newPage();
    });

    afterEach(async () => {
        await page.close();
    });

    afterAll(async () => {
        await browser.close();
    });

    test.each(["oc-lcw", "custom-chat-dialog"])(
        "keeps incoming announcements accessible inside %s without moving composer focus",
        async (widgetId) => {
            const fixture = path.resolve(__dirname, "../../..", "customlivechatwidgets/IncomingMessageAnnouncementWidget.html");
            await page.goto(`${pathToFileURL(fixture).href}?widgetId=${widgetId}`);
            await page.waitForSelector("#oc-lcw-chat-button");
            // Host content sharing the widget's mount container must stay hidden while the dialog is open (TalkBack containment, #912).
            await page.evaluate(() => {
                const hostSibling = document.createElement("div");
                hostSibling.id = "host-sibling";
                hostSibling.textContent = "Host page content";
                document.getElementById("oc-lcw-container")?.appendChild(hostSibling);
            });
            const hostSibling = page.locator("#host-sibling");
            await page.click("#oc-lcw-chat-button");
            expect(await hostSibling.getAttribute("aria-hidden")).toBe("true");
            const composer = page.locator("textarea[data-id='webchat-sendbox-input']");
            await composer.fill("Hello");
            await composer.focus();

            await page.evaluate(() => {
                const testWindow = window as AnnouncementWindow;
                testWindow.announcements = [];
                new MutationObserver(() => {
                    document.querySelectorAll("[aria-live='polite'],[aria-live='assertive']").forEach(region => {
                        const dialog = document.querySelector("[role='dialog'][aria-modal='true']");
                        region.querySelectorAll(".webchat__live-region-activity").forEach(activity => {
                            testWindow.announcements.push({
                                text: activity.textContent || "",
                                hidden: !!activity.closest("[aria-hidden='true'],[inert]"),
                                insideDialog: !!dialog && dialog.contains(activity)
                            });
                        });
                    });
                }).observe(document.body, { subtree: true, childList: true, characterData: true });
            });

            for (const scenario of ["bot", "agent", "reopened"]) {
                if (scenario === "reopened") {
                    await page.click("#lcw-header-minimize-button");
                    expect(await page.locator(`#${widgetId}`).getAttribute("aria-modal")).toBeNull();
                    expect(await hostSibling.getAttribute("aria-hidden")).toBeNull();
                    await page.click("#oc-lcw-chat-button");
                    await composer.waitFor();
                    await composer.focus();
                }
                const message = `Incoming ${scenario} reply`;
                await page.evaluate(({ scenario, message }) => {
                    return (window as AnnouncementWindow).receiveMessage(
                        `incoming-${scenario}`, message, scenario === "bot" ? "bot" : "agent"
                    );
                }, { scenario, message });
                await page.waitForFunction(
                    text => (window as AnnouncementWindow).announcements.some(announcement => announcement.text.includes(text)),
                    message
                );
                const announcements = await page.evaluate(
                    text => (window as AnnouncementWindow).announcements.filter(announcement => announcement.text.includes(text)),
                    message
                );
                expect(announcements.length).toBeGreaterThan(0);
                expect(announcements.every(announcement => !announcement.hidden)).toBe(true);
                expect(announcements.every(announcement => announcement.insideDialog)).toBe(true);
                expect(await composer.evaluate(element => element === document.activeElement)).toBe(true);
                expect(await page.locator(`#${widgetId} .webchat__basic-transcript`).textContent()).toContain(message);
            }

            expect(await page.locator(`#${widgetId}`).getAttribute("role")).toBe("dialog");
            expect(await page.locator(`#${widgetId}`).getAttribute("aria-modal")).toBe("true");
            expect(await hostSibling.getAttribute("aria-hidden")).toBe("true");
            expect(await page.locator(`#${widgetId} #host-button`).count()).toBe(0);
        },
        30000
    );

    // Copilot Studio bots send answers as Adaptive Cards without `speak`. Web Chat then announces only "A card:".
    // The announcement must contain the card text, without Markdown syntax, also when the widget shows Markdown unformatted.
    test.each(["on", "off"])(
        "announces the text of an incoming Adaptive Card without speak (Markdown formatting %s)",
        async (markdown) => {
            const fixture = path.resolve(__dirname, "../../..", "customlivechatwidgets/IncomingMessageAnnouncementWidget.html");
            await page.goto(`${pathToFileURL(fixture).href}?markdown=${markdown}`);
            await page.waitForSelector("#oc-lcw-chat-button");
            await page.click("#oc-lcw-chat-button");
            const composer = page.locator("textarea[data-id='webchat-sendbox-input']");
            await composer.waitFor();
            await composer.focus();

            await page.evaluate(() => {
                const testWindow = window as AnnouncementWindow;
                testWindow.announcements = [];
                new MutationObserver(() => {
                    document.querySelectorAll(".webchat__live-region .webchat__live-region-activity").forEach(activity => {
                        testWindow.announcements.push({ text: activity.textContent || "", hidden: !!activity.closest("[aria-hidden='true'],[inert]"), insideDialog: true });
                    });
                }).observe(document.body, { subtree: true, childList: true, characterData: true });
            });

            await page.evaluate(() => (window as AnnouncementWindow).receiveMessage("incoming-card", "", "bot", [{
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    version: "1.5",
                    body: [{
                        type: "TextBlock",
                        wrap: true,
                        text: "**How to Reset Your Password**\n\n- Select Forgot password on the sign-in page.\n- Follow the link in the email."
                    }]
                }
            }]));

            await page.waitForFunction(() => (window as AnnouncementWindow).announcements.some(announcement => /card/i.test(announcement.text)));
            const announcements = await page.evaluate(() => (window as AnnouncementWindow).announcements.filter(announcement => /card/i.test(announcement.text)));
            expect(announcements.map(announcement => announcement.text.replace(/\s+/g, " ")).join(" | "))
                .toContain("How to Reset Your Password Select Forgot password on the sign-in page. Follow the link in the email.");
            expect(announcements.every(announcement => !announcement.text.includes("**") && !announcement.hidden)).toBe(true);
            expect(await page.locator(".webchat__basic-transcript .ac-adaptiveCard").textContent()).toContain("How to Reset Your Password");
            expect(await composer.evaluate(element => element === document.activeElement)).toBe(true);
        },
        30000
    );
});
