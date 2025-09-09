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
            const page = await browser[browserType].newPage(options);
            return page;
        },
        afterScreenshot: async (page) => {
            await page.close();
        },
    });
});

afterAll(async () => {
    const promises = Object.keys(browser).map((browserType) =>
        browser[browserType].close(),
    );
    await Promise.resolve(promises);
});