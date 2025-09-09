import { getScreenshots } from "storybook-addon-playwright";

describe("test screenshots manually", () => {
    it("should pass image diff", async () => {
        await getScreenshots({
            requestId: "id",
            onScreenshotReady: (screenshotBuffer, baselineScreenshotPath) => {
                // Firefox has known font rendering inconsistencies across environments
                // With fixed sizing, threshold can be lower but still higher for Firefox
                const isFirefox = baselineScreenshotPath.screenshotIdentifier.includes('firefox');
                const failureThreshold = 0.05; // 6% for Firefox, 5.3% for others
                
                expect(screenshotBuffer).toMatchImageSnapshot({
                    failureThreshold,
                    failureThresholdType: "percent",
                    customSnapshotIdentifier: baselineScreenshotPath.screenshotIdentifier,
                    customSnapshotsDir: baselineScreenshotPath.screenshotsDir,
                    // Additional options for better cross-environment consistency
                    comparisonMethod: 'pixelmatch',
                    blur: isFirefox ? 2 : 1, // More blur for Firefox to handle font differences
                    threshold: 0.1, // Lower threshold for pixel comparison
                });
            }
        });
    }, 3000000);
});