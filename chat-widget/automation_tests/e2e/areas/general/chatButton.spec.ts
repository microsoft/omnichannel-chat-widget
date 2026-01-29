import { Browser, BrowserContext } from "playwright";
import * as playwright from "playwright";
import { TestSettings } from "../../../configuration/test-settings";
import { BasePage } from "../../pages/base.page";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";

describe("live chat button", () => {
    let newBrowser: Browser;
    let context: BrowserContext;
    let page: BasePage;

    beforeEach(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newBrowser = await playwright[TestSettings.Browsers as any].launch(
            TestSettings.LaunchBrowserSettings
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

    test("chat button visible", async () => {
        page = new BasePage(await context.newPage());
        await page.openLiveChatWidget();
        await page.waitUntilLiveChatSelectorIsVisible(
            CustomLiveChatWidgetConstants.LiveChatButtonId
        );
    });
});
