import { getScreenshots } from "storybook-addon-playwright";

describe("test screenshots manually", () => {
    it("should pass image diff", async () => {
        const failedScreenshots: string[] = [];
        let totalScreenshots = 0;
        
        await getScreenshots({
            requestId: "id",
            onScreenshotReady: (screenshotBuffer, baselineScreenshotPath) => {
                totalScreenshots++;
                const screenshotId = baselineScreenshotPath.screenshotIdentifier;
                
                console.log(`🔍 Testing screenshot: ${screenshotId}`);
                
                try {
                    expect(screenshotBuffer).toMatchImageSnapshot({
                        failureThreshold: 5,
                        failureThresholdType: "percent",
                        customSnapshotIdentifier: screenshotId,
                        customSnapshotsDir: baselineScreenshotPath.screenshotsDir,
                    });
                    console.log(`✅ PASSED: ${screenshotId}`);
                } catch (error) {
                    console.error(`❌ FAILED: ${screenshotId}`);
                    console.error(`   Error: ${error.message}`);
                    failedScreenshots.push(screenshotId);
                    
                    // Still throw the error to maintain test failure behavior
                    throw error;
                }
            }
        });
        
        console.log("\n📊 VISUAL TEST SUMMARY:");
        console.log(`   Total Screenshots: ${totalScreenshots}`);
        console.log(`   Failed Screenshots: ${failedScreenshots.length}`);
        
        if (failedScreenshots.length > 0) {
            console.log("\n❌ FAILED SCREENSHOTS:");
            failedScreenshots.forEach((id, index) => {
                console.log(`   ${index + 1}. ${id}`);
            });
            console.log("\n📁 Check __diff_output__ folder for visual diffs\n");
        }
    }, 3000000);
});