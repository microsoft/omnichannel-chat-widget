const middleware = require('storybook-addon-playwright/middleware');
module.exports = middleware;

const { setConfig } = require('storybook-addon-playwright/configs');
const playwright = require('playwright');

(async () => {
  let browser = {
    chromium: await playwright['chromium'].launch(),
    firefox: await playwright['firefox'].launch(),
    webkit: await playwright['webkit'].launch(),
  };
  setConfig({
    storybookEndpoint: `http://localhost:9009/`,
    getPage: async (browserType, options) => {
      const page = await browser[browserType].newPage(options);
      return page;
    },
    afterScreenshot: async (page) => {
      await page.close();
    }
  });
})();