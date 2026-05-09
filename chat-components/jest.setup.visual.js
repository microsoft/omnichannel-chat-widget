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
            await preparePageForProfile(page, screenshotProfile);
            // Intercept any request to known external survey hosts so VRT does not
            // depend on real network/iframe-load latency. The story files keep their
            // live URLs so manual `yarn storybook` still exercises the real survey,
            // but visual snapshots see a deterministic local fixture.
            // See: https://github.com/microsoft/omnichannel-chat-widget/issues/921
            const surveyFixtureHosts = new Set([
                "ncv.microsoft.com",
                "customervoice.microsoft.com",
                "tip.customervoice.microsoft.com"
            ]);
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
            await page.route("**/*", async (route) => {
                try {
                    const reqUrl = new URL(route.request().url());
                    if (surveyFixtureHosts.has(reqUrl.hostname)) {
                        await route.fulfill({
                            status: 200,
                            contentType: "text/html; charset=utf-8",
                            body: surveyFixtureHtml
                        });
                        return;
                    }
                } catch (_e) {
                    // fall through to continue
                }
                await route.continue();
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
    await Promise.all(promises);
});
