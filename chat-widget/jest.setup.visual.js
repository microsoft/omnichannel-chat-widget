import "core-js";

import playwright from "playwright";
import { setConfig } from "storybook-addon-playwright/configs";
import { toMatchScreenshots } from "storybook-addon-playwright";
import storybookAccessibilityTooling from "../tools/accessibility/storybookProfiles.cjs";

expect.extend({ toMatchScreenshots });

const {
    getEnabledBrowsers,
    mergePageOptions,
    preparePageForProfile,
    resolveStorybookProfile
} = storybookAccessibilityTooling;

// Enhanced error reporting for visual tests
const originalFail = global.fail;
global.fail = (message) => {
    console.error(`❌ Visual Test Failure: ${message}`);
    if (originalFail) {
        originalFail(message);
    } else {
        throw new Error(message);
    }
};

let browser = {};
const screenshotProfile = resolveStorybookProfile(process.env.STORYBOOK_SCREENSHOT_PROFILE);
const browserNames = getEnabledBrowsers(playwright, process.env.STORYBOOK_BROWSERS, screenshotProfile.defaultBrowsers);

//Making Timeout to 50s
jest.setTimeout(50000);

beforeAll(async () => {
    for (const browserName of browserNames) {
        browser[browserName] = await playwright[browserName].launch();
    }

    console.log(`📱 Storybook screenshot profile: ${screenshotProfile.name} (${screenshotProfile.description})`);
    console.log(`🌐 Storybook browsers: ${browserNames.join(", ")}`);

    setConfig({
        storybookEndpoint: "./storybook-static",
        getPage: async (browserType, options) => {
            if (!browser[browserType]) {
                throw new Error(`Browser "${browserType}" was not launched for profile "${screenshotProfile.name}".`);
            }

            console.log("Browser for visual test : ,", browserType);
            const page = await browser[browserType].newPage(mergePageOptions(screenshotProfile, options));
            return page;
        },
        afterScreenshot: async (page) => {
            console.log(`✅ Completed visual test for: ${page.url()}`);
            await page.close();
        },
        beforeScreenshot: async (page) => {
            console.log(`🔍 Starting visual test for: ${page.url()}`);
            await page.waitForLoadState("load", { timeout: 10000 });
            await preparePageForProfile(page, screenshotProfile);
        },
        onScreenshotError: async (error, page) => {
            console.error(`❌ Visual test FAILED for: ${page.url()}`);
            console.error(`   Error: ${error.message}`);
            console.error(`   Expected screenshot path: ${error.expectedPath || "unknown"}`);
            console.error(`   Received screenshot path: ${error.receivedPath || "unknown"}`);
            console.error(`   Diff screenshot path: ${error.diffPath || "unknown"}`);
        },

    });
});

afterAll(async () => {
    const promises = Object.keys(browser).map((browserType) =>
        browser[browserType].close(),
    );
    await Promise.all(promises);
});
