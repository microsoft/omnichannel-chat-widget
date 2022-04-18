import { getScreenshots } from "storybook-addon-playwright";

describe("test screenshots manually", () => {
    it("should pass image diff", async () => {
        await getScreenshots({
            requestId: "id",
            onScreenshotReady: (screenshotBuffer, baselineScreenshotPath) => {
                expect(screenshotBuffer).toMatchImageSnapshot({
                    failureThreshold: 0.05,
                    failureThresholdType: "percent",
                    customSnapshotIdentifier: baselineScreenshotPath.screenshotIdentifier,
                    customSnapshotsDir: baselineScreenshotPath.screenshotsDir,
                });
            }
        });
    }, 3000000);
});