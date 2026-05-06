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
        pageGotoOptions: {
            timeout: 120000,
            waitUntil: "domcontentloaded"
        },
        getPage: async (browserType, options) => {
            if (!browser[browserType]) {
                throw new Error(`Browser "${browserType}" was not launched for profile "${screenshotProfile.name}".`);
            }

            const page = await browser[browserType].newPage(mergePageOptions(screenshotProfile, options));
            return page;
        },
        afterScreenshot: async (page) => {
            await page.close();
        },
        beforeScreenshot: async (page) => {
            await page.waitForLoadState("load", { timeout: 10000 });
            await preparePageForProfile(page, screenshotProfile);
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
    await Promise.all(promises);
});
