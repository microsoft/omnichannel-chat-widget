const DEFAULT_BROWSERS = Object.freeze(["chromium", "firefox", "webkit"]);
const CHROMIUM_ONLY_BROWSERS = Object.freeze(["chromium"]);

const SCREENSHOT_PROFILES = Object.freeze({
    "desktop-default": {
        description: "Default desktop Storybook regression profile",
        defaultBrowsers: DEFAULT_BROWSERS,
        pageOptions: {
            viewport: { width: 1280, height: 720 },
            deviceScaleFactor: 1
        },
        emulateMedia: {
            colorScheme: "light",
            reducedMotion: "no-preference"
        }
    },
    "mobile-iphone": {
        description: "Chromium mobile emulation approximating iPhone 12 portrait",
        defaultBrowsers: CHROMIUM_ONLY_BROWSERS,
        pageOptions: {
            viewport: { width: 390, height: 844 },
            screen: { width: 390, height: 844 },
            deviceScaleFactor: 3,
            hasTouch: true,
            isMobile: true,
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/123.0.0.0 Mobile/15E148 Safari/604.1"
        },
        emulateMedia: {
            colorScheme: "light",
            reducedMotion: "no-preference"
        }
    },
    "mobile-android": {
        description: "Chromium mobile emulation approximating Pixel 5 portrait",
        defaultBrowsers: CHROMIUM_ONLY_BROWSERS,
        pageOptions: {
            viewport: { width: 393, height: 851 },
            screen: { width: 393, height: 851 },
            deviceScaleFactor: 2.75,
            hasTouch: true,
            isMobile: true,
            userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"
        },
        emulateMedia: {
            colorScheme: "light",
            reducedMotion: "no-preference"
        }
    },
    "reflow-320": {
        description: "Chromium narrow-width reflow profile at 320 CSS pixels",
        defaultBrowsers: CHROMIUM_ONLY_BROWSERS,
        pageOptions: {
            viewport: { width: 320, height: 900 },
            screen: { width: 320, height: 900 },
            deviceScaleFactor: 1,
            hasTouch: true,
            isMobile: true,
            userAgent: "Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36"
        },
        emulateMedia: {
            colorScheme: "light",
            reducedMotion: "no-preference"
        }
    },
    "zoom-200": {
        description: "Chromium desktop profile with 200% page zoom applied before screenshots",
        defaultBrowsers: CHROMIUM_ONLY_BROWSERS,
        pageOptions: {
            viewport: { width: 1280, height: 720 },
            deviceScaleFactor: 1
        },
        emulateMedia: {
            colorScheme: "light",
            reducedMotion: "no-preference"
        },
        zoomPercent: 200
    }
});

const parseBrowserList = (rawBrowsers) => {
    if (!rawBrowsers) {
        return undefined;
    }

    const trimmedValue = rawBrowsers.trim();
    if (!trimmedValue) {
        return undefined;
    }

    if (trimmedValue.startsWith("[")) {
        const parsedValue = JSON.parse(trimmedValue);
        if (!Array.isArray(parsedValue)) {
            throw new Error("STORYBOOK_BROWSERS must be a JSON array when using JSON syntax.");
        }

        return parsedValue
            .map((browserName) => `${browserName}`.trim())
            .filter(Boolean);
    }

    return trimmedValue
        .split(",")
        .map((browserName) => browserName.trim())
        .filter(Boolean);
};

const resolveStorybookProfile = (profileName = "desktop-default") => {
    const normalizedProfileName = `${profileName}`.trim() || "desktop-default";
    const profile = SCREENSHOT_PROFILES[normalizedProfileName];

    if (!profile) {
        throw new Error(
            `Unknown STORYBOOK_SCREENSHOT_PROFILE "${normalizedProfileName}". ` +
            `Available profiles: ${Object.keys(SCREENSHOT_PROFILES).join(", ")}.`
        );
    }

    return {
        name: normalizedProfileName,
        ...profile
    };
};

const getEnabledBrowsers = (playwright, rawBrowsers, defaultBrowsers = DEFAULT_BROWSERS) => {
    const requestedBrowsers = parseBrowserList(rawBrowsers) || defaultBrowsers;

    return requestedBrowsers.map((browserName) => {
        if (!playwright[browserName]) {
            throw new Error(
                `Unsupported browser "${browserName}" requested via STORYBOOK_BROWSERS. ` +
                `Supported browsers: ${DEFAULT_BROWSERS.join(", ")}.`
            );
        }

        return browserName;
    });
};

const mergePageOptions = (profile, options = {}) => ({
    ...profile.pageOptions,
    ...options,
    viewport: profile.pageOptions?.viewport || options.viewport
        ? { ...(profile.pageOptions?.viewport || {}), ...(options.viewport || {}) }
        : undefined,
    screen: profile.pageOptions?.screen || options.screen
        ? { ...(profile.pageOptions?.screen || {}), ...(options.screen || {}) }
        : undefined
});

const preparePageForProfile = async (page, profile) => {
    if (profile.emulateMedia) {
        await page.emulateMedia(profile.emulateMedia);
    }

    if (profile.zoomPercent && profile.zoomPercent !== 100) {
        await page.addStyleTag({
            content: `html { zoom: ${profile.zoomPercent}%; }`
        });
    }
};

module.exports = {
    DEFAULT_BROWSERS,
    SCREENSHOT_PROFILES,
    getEnabledBrowsers,
    mergePageOptions,
    parseBrowserList,
    preparePageForProfile,
    resolveStorybookProfile
};
