import "core-js";

import { existsSync, mkdirSync, readdirSync } from "fs";

import { join } from "path";
import playwright from "playwright";
import { setConfig } from "storybook-addon-playwright/configs";
import { toMatchScreenshots } from "storybook-addon-playwright";

expect.extend({ toMatchScreenshots });

// Fix for storybook-addon-playwright not creating __diff_output__ directories
const ensureDiffOutputDirectories = () => {
    const servicesDir = join(process.cwd(), "node_modules", "storybook-addon-playwright", "dist", "api", "server", "services");
    
    if (existsSync(servicesDir)) {
        const storyDirs = readdirSync(servicesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => name.startsWith("stateless-components-"));
        
        storyDirs.forEach(storyName => {
            const diffOutputDir = join(servicesDir, storyName, "__diff_output__");
            if (!existsSync(diffOutputDir)) {
                mkdirSync(diffOutputDir, { recursive: true });
                console.log(`Created missing __diff_output__ directory for ${storyName}`);
            }
        });
    }
};

let browser = {};

//Making Timeout to 50s
jest.setTimeout("50000");

beforeAll(async () => {
    // Ensure __diff_output__ directories exist for any existing story directories
    // This fixes the Firefox ENOENT error when saving diff screenshots
    ensureDiffOutputDirectories();
    
    // Enhanced browser launch options for consistent rendering across environments
    const browserOptions = {
        // Consistent viewport settings
        args: [
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
            "--disable-dev-shm-usage",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu-sandbox",
            "--disable-software-rasterizer",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
            "--disable-field-trial-config",
            "--disable-back-forward-cache",
            "--disable-ipc-flooding-protection",
            "--force-color-profile=srgb",
            "--disable-font-subpixel-positioning",
            "--disable-lcd-text",
            "--disable-gpu-rasterization",
            "--disable-partial-raster",
            "--use-gl=swiftshader"
        ]
    };

    browser = {
        chromium: await playwright["chromium"].launch(browserOptions),
        firefox: await playwright["firefox"].launch(browserOptions),
        webkit: await playwright["webkit"].launch(browserOptions),
    };
    
    setConfig({
        storybookEndpoint: "./storybook-static",
        getPage: async (browserType, options) => {
            const page = await browser[browserType].newPage({
                // Set consistent viewport and device scale factor
                viewport: { width: 1280, height: 720 },
                deviceScaleFactor: 1,
                // Disable animations for consistent screenshots
                reducedMotion: "reduce",
                // Force consistent color scheme
                colorScheme: "light",
                // Set consistent timezone
                timezoneId: "UTC",
                ...options
            });
            
            // Additional page-level settings for consistency
            await page.addInitScript(() => {
                // Disable smooth scrolling
                Object.defineProperty(document.documentElement.style, "scrollBehavior", {
                    value: "auto",
                    writable: false
                });
                
                // Force consistent font rendering
                document.documentElement.style.setProperty("-webkit-font-smoothing", "antialiased");
                document.documentElement.style.setProperty("-moz-osx-font-smoothing", "grayscale");
                document.documentElement.style.setProperty("text-rendering", "optimizeLegibility");
            });
            
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