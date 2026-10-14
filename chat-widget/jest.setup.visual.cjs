require("core-js");

const { setConfig } = require("storybook-addon-playwright/configs");
const { toMatchScreenshots } = require("storybook-addon-playwright");
const storybookAccessibilityTooling = require("../tools/accessibility/storybookProfiles.cjs");

const { ReadableStream, TransformStream, WritableStream } = require("node:stream/web");
const { Blob, File } = require("node:buffer");
const { MessageChannel, MessagePort } = require("node:worker_threads");

// Jest 27 omits some Node 22 web globals from its VM context. Add only missing
// values so the harness never replaces Node's built-in undici/Web Streams realm.
const platformGlobals = {
    Blob,
    File,
    MessageChannel,
    MessagePort,
    ReadableStream,
    TransformStream,
    WritableStream
};
for (const [name, value] of Object.entries(platformGlobals)) {
    if (typeof globalThis[name] === "undefined") {
        globalThis[name] = value;
    }
}

const { fetch, FormData, Headers, Request, Response } = require("undici");
for (const [name, value] of Object.entries({ fetch, FormData, Headers, Request, Response })) {
    if (typeof globalThis[name] === "undefined") {
        globalThis[name] = value;
    }
}
const playwright = require("playwright");

expect.extend({ toMatchScreenshots });

const {
    getEnabledBrowsers,
    mergePageOptions,
    preparePageForProfile,
    resolveStorybookProfile
} = storybookAccessibilityTooling;

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
            return browser[browserType].newPage(mergePageOptions(screenshotProfile, options));
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
        }
    });
});

afterAll(async () => {
    await Promise.all(Object.keys(browser).map((browserType) => browser[browserType].close()));
});
