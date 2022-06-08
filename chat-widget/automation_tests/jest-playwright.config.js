// eslint-disable-next-line @typescript-eslint/no-var-requires
const testdata = require("./configuration/testsettings.json");
module.exports = {
    browsers: process.env.browsers
        ? JSON.parse(process.env.browsers)
        : testdata.browsers,
    devices: process.env.devices
        ? JSON.parse(process.env.devices)
        : testdata.devices,
    launchBrowserApp: {
        headless: testdata.launchBrowserSettings.headless,
        args: testdata.launchBrowserSettings.args,
        slowMo: testdata.launchBrowserSettings.slowMo,
    },
};
