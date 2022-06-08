import * as testData from "./testsettings.json";

export class TestSettings {
    public static get Devices(): string[] {
        return process.env.devices
            ? JSON.parse(process.env.devices)
            : testData.devices;
    }

    public static get Browsers(): string[] {
        return process.env.browsers
            ? JSON.parse(process.env.browsers)
            : testData.browsers;
    }

    public static get Browser(): string {
        return process.env.browser ? process.env.browser : testData.browsers[0];
    }

    public static get OrgUrl(): string {
        let orgUrl = process.env.OrgUrl || testData.OrgUrl;
        if (orgUrl.charAt(orgUrl.length - 1) === "/") {
            orgUrl = orgUrl.slice(0, -1);
        }
        return orgUrl;
    }

    public static get AppId(): string {
        return process.env.AppId || testData.AppId;
    }

    public static get OrgId(): string {
        return process.env.OrgId || testData.OrgId;
    }

    public static get LaunchBrowserSettings() {
        return testData.launchBrowserSettings;
    }

    public static get Viewport() {
        return { width: 1900, height: 900 };
    }
}
