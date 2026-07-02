// Real-Android accessibility-tree check for the widget "focus escape" bug.
//
// What this proves that the existing Playwright mobile-viewport test cannot:
// Playwright emulation runs desktop Chromium at a phone viewport and only checks
// the keyboard Tab boundary. It never builds the Android accessibility tree, so
// it cannot tell whether aria-hidden on ancestor-level siblings actually removes
// the background from what a TalkBack swipe can reach.
//
// Here we launch the emulator's real Chrome with --force-renderer-accessibility
// (so the web a11y tree is exported into the native Android accessibility tree),
// open the widget, then read the NATIVE accessibility tree via UiAutomator2 and
// assert the background markers are gone. Reverting the product fix flips this
// from GREEN to RED, which is what makes it a genuine catcher.
//
// Prereq: Appium server on 127.0.0.1:4723 (uiautomator2 driver) + a booted
// emulator + the static harness server. See README.md / run-all.ps1.

const { remote } = require("webdriverio");

const HARNESS_PORT = process.env.HARNESS_PORT || "8099";
const HARNESS_URL = "http://10.0.2.2:" + HARNESS_PORT + "/androidFocusEscape.html";
const BG_MARKERS = ["BG-HEADER-LINK", "BG-SIDEBAR-LINK", "BG-FOOTER-LINK"];
const WIDGET_MARKER = "WIDGET-DIALOG-CONTENT";

const capabilities = {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:browserName": "Chrome",
    "appium:chromedriverAutodownload": true,
    "appium:newCommandTimeout": 180,
    "appium:autoGrantPermissions": true,
    "appium:chromeOptions": {
        args: [
            "--force-renderer-accessibility",
            "--disable-fre",
            "--no-first-run",
            "--no-default-browser-check"
        ]
    }
};

function fail(msg) {
    console.error("FAIL: " + msg);
    process.exitCode = 1;
}

async function nativeSource(driver) {
    const current = await driver.getContext();
    await driver.switchContext("NATIVE_APP");
    const src = await driver.getPageSource();
    await driver.switchContext(current);
    return src;
}

async function markersPresent(driver, markers) {
    const src = await nativeSource(driver);
    return markers.filter((m) => src.indexOf(m) !== -1);
}

(async () => {
    let driver;
    try {
        driver = await remote({
            hostname: "127.0.0.1",
            port: 4723,
            path: "/",
            logLevel: "error",
            capabilities
        });

        await driver.url(HARNESS_URL);
        const openBtn = await driver.$("#open-btn");
        await openBtn.waitForExist({ timeout: 20000 });

        // Baseline: with the widget closed, the background must be reachable.
        let bg = await markersPresent(driver, BG_MARKERS);
        if (bg.length !== BG_MARKERS.length) {
            fail("Baseline (closed) expected all background markers reachable but only saw: " + bg.join(", ") +
                ". The harness or a11y export is not working; cannot trust the result.");
            return;
        }
        console.log("Baseline OK: background reachable when widget closed (" + bg.join(", ") + ").");

        // Open the widget, then the background must NOT be reachable.
        await openBtn.click();
        await driver.pause(600);

        bg = await markersPresent(driver, [...BG_MARKERS, WIDGET_MARKER]);
        const leaked = bg.filter((m) => m !== WIDGET_MARKER);
        const widgetReachable = bg.indexOf(WIDGET_MARKER) !== -1;

        if (!widgetReachable) {
            fail("Widget content (" + WIDGET_MARKER + ") not reachable while open; the harness a11y export may be broken.");
            return;
        }
        if (leaked.length > 0) {
            fail("Focus escape reproduced: background still reachable in the Android accessibility tree while the widget is open: " +
                leaked.join(", ") + ". A TalkBack swipe would leave the dialog. (This is RED, expected only on the unfixed code.)");
        } else {
            console.log("PASS (open): background removed from the Android accessibility tree; only the widget is reachable.");
        }

        // Close and confirm the background is restored (no leaked aria-hidden).
        const closeBtn = await driver.$("#close-btn");
        await closeBtn.click();
        await driver.pause(600);
        const restored = await markersPresent(driver, BG_MARKERS);
        if (restored.length !== BG_MARKERS.length) {
            fail("After close, background not fully restored. Reachable: " + restored.join(", ") +
                ". setAriaHiddenForSiblings did not restore prior state.");
        } else {
            console.log("PASS (close): background fully restored (" + restored.join(", ") + ").");
        }

        if (!process.exitCode) {
            console.log("RESULT: GREEN - focus escape does not reproduce on the real Android accessibility tree.");
        } else {
            console.log("RESULT: RED - see failures above.");
        }
    } catch (err) {
        fail("Harness error (not a product assertion): " + (err && err.message ? err.message : String(err)));
    } finally {
        if (driver) {
            try { await driver.deleteSession(); } catch (e) { /* ignore */ }
        }
    }
})();
