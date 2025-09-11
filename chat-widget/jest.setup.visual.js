import "core-js";

import playwright from "playwright";
import { setConfig } from "storybook-addon-playwright/configs";
import { toMatchScreenshots } from "storybook-addon-playwright";

expect.extend({ toMatchScreenshots });

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

//Making Timeout to 50s
jest.setTimeout("50000");

beforeAll(async () => {
    browser = {
        chromium: await playwright["chromium"].launch(),
        firefox: await playwright["firefox"].launch(),
        webkit: await playwright["webkit"].launch(),
    };

    setConfig({
        storybookEndpoint: "./storybook-static",
        getPage: async (browserType, options) => {
            console.log("Browser for visual test : ,", browserType);
            const page = await browser[browserType].newPage(options);
            return page;
        },
        afterScreenshot: async (page) => {
            console.log(`✅ Completed visual test for: ${page.url()}`);
            await page.close();
        },
        beforeScreenshot: async (page) => {
            console.log(`🔍 Starting visual test for: ${page.url()}`);
            await page.waitForLoadState("load",{ timeout: 10000 });
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
    await Promise.resolve(promises);
});