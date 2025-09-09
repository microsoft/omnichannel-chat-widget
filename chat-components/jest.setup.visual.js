import "core-js";

import playwright from "playwright";
import { setConfig } from "storybook-addon-playwright/configs";
import { toMatchScreenshots } from "storybook-addon-playwright";

expect.extend({ toMatchScreenshots });

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
            const page = await browser[browserType].newPage({
                viewport: { width: 1280, height: 720 }, // Consistent viewport for local and CI
                deviceScaleFactor: 1, // Consistent DPI scaling
                ...options
            });
            return page;
        },
        afterScreenshot: async (page) => {
            await page.close();
        },
        screenshotOptions: {
            // Target ONLY the Firefox custom-components screenshot (ID: kF8sVvQpcm8X)
            clip: (screenshotInfo) => {
                if (screenshotInfo.screenshotId === "kF8sVvQpcm8X") {
                    return { x: 0, y: 0, width: 800, height: 600 };
                }
                return undefined; // Default behavior for all other screenshots
            }
        }
    });
});

afterAll(async () => {
    const promises = Object.keys(browser).map((browserType) =>
        browser[browserType].close(),
    );
    await Promise.resolve(promises);
});