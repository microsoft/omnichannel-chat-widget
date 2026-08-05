require("core-js");

const { setConfig } = require("storybook-addon-playwright/configs");
const { toMatchScreenshots } = require("storybook-addon-playwright");
const storybookAccessibilityTooling = require("../tools/accessibility/storybookProfiles.cjs");

const { ReadableStream, TransformStream, WritableStream } = require("node:stream/web");
const { Blob, File } = require("node:buffer");
const { MessageChannel, MessagePort } = require("node:worker_threads");
Object.assign(globalThis, { Blob, File, MessageChannel, MessagePort, ReadableStream, TransformStream, WritableStream });
const { fetch, FormData, Headers, Request, Response } = require("undici");
Object.assign(globalThis, { fetch, FormData, Headers, Request, Response });
const playwright = require("playwright");

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

jest.setTimeout(50000);

const HOOK_TIMEOUT_MS = 120000;
const BROWSER_CLOSE_TIMEOUT_MS = 30000;

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
            const surveyFixtureHtml = "<!DOCTYPE html>"
                + "<html lang=\"en\"><head><meta charset=\"utf-8\"><title>Survey fixture</title>"
                + "<style>body{font-family:Segoe UI,Arial,sans-serif;background:#fff;color:#000;margin:0;padding:24px}"
                + "h1{font-size:18px;margin:0 0 16px}"
                + ".q{margin:12px 0}label{display:block;font-size:14px;margin-bottom:4px}"
                + "input,textarea{width:100%;font-size:14px;padding:6px;box-sizing:border-box;border:1px solid #ccc}"
                + "button{background:#0078d4;color:#fff;border:0;padding:8px 16px;font-size:14px;margin-top:12px}"
                + "</style></head><body>"
                + "<h1>Post-chat survey (test fixture)</h1>"
                + "<div class=\"q\"><label>How would you rate your experience?</label>"
                + "<input type=\"text\" value=\"\" readonly></div>"
                + "<div class=\"q\"><label>Comments</label><textarea rows=\"3\" readonly></textarea></div>"
                + "<button type=\"button\">Submit</button>"
                + "</body></html>";
            await page.route(
                /^https?:\/\/(ncv\.microsoft\.com|([a-z]+\.)?customervoice\.microsoft\.com)\//,
                (route) => route.fulfill({
                    status: 200,
                    contentType: "text/html; charset=utf-8",
                    body: surveyFixtureHtml
                })
            );
            return page;
        },
        afterScreenshot: async (page) => {
            await page.close();
        },
        beforeScreenshot: async (page) => {
            await page.waitForLoadState("load", { timeout: 10000 });
            await page.locator(".sb-preparing-story").waitFor({ state: "hidden", timeout: 10000 });
            await preparePageForProfile(page, screenshotProfile);
        },
        screenshotOptions: {
            clip: (screenshotInfo) => {
                if (screenshotInfo.screenshotId === "kF8sVvQpcm8X") {
                    return { x: 0, y: 0, width: 800, height: 600 };
                }
                return undefined;
            }
        }
    });
}, HOOK_TIMEOUT_MS);

afterAll(async () => {
    for (const browserType of Object.keys(browser)) {
        const instance = browser[browserType];
        if (!instance) continue;
        try {
            const contexts = instance.contexts();
            const pageCount = contexts.reduce((sum, ctx) => sum + ctx.pages().length, 0);
            console.log(`🧹 Teardown: ${browserType} has ${contexts.length} context(s), ${pageCount} open page(s)`);
        } catch (err) {
            console.warn(`Could not inspect "${browserType}" before close:`, err && err.message ? err.message : err);
        }
    }

    const closeWithTimeout = (browserType) => {
        const instance = browser[browserType];
        if (!instance) {
            return Promise.resolve();
        }
        const startedAt = Date.now();
        let timeoutId;
        return Promise.race([
            instance.close().then(() => {
                console.log(`✅ Closed "${browserType}" in ${Date.now() - startedAt}ms`);
            }).catch((err) => {
                console.warn(`Failed to close browser "${browserType}":`, err && err.message ? err.message : err);
            }),
            new Promise((resolve) => {
                timeoutId = setTimeout(() => {
                    console.warn(`⏱️ Timed out closing browser "${browserType}" after ${BROWSER_CLOSE_TIMEOUT_MS}ms; continuing teardown.`);
                    resolve();
                }, BROWSER_CLOSE_TIMEOUT_MS);
            })
        ]).finally(() => clearTimeout(timeoutId));
    };

    await Promise.all(Object.keys(browser).map(closeWithTimeout));
}, HOOK_TIMEOUT_MS);
