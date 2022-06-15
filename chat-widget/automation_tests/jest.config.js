// eslint-disable-next-line @typescript-eslint/no-var-requires
const { pathsToModuleNameMapper } = require("ts-jest/utils");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { compilerOptions } = require("./tsconfig.json");

module.exports = {
    preset: "jest-playwright-preset",
    testRunner: "jest-circus/runner",
    setupFilesAfterEnv: ["expect-playwright", "./jest.setup.js"],
    testEnvironment: "./configuration/CustomEnvironment.js",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
    testResultsProcessor: "jest-junit",
    testMatch: ["**/e2e/areas/**/*.spec.ts", "**/?(*.)+(spec|test).+(ts)"],
    testPathIgnorePatterns: ["/dist/", "/node_modules/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    reporters: [
        "default",
        [
            "jest-junit",
            {
                suiteName: "LiveChatWidget e2e tests",
                outputDirectory: "./reports/",
                outputName: "./junit.xml",
                usePathForSuiteName: "true",
                includeConsoleOutput: "true",
            },
        ],
        [
            "jest-html-reporters",
            {
                publicPath: "./reports/",
                filename: "report.html",
                expand: true,
            },
        ],
    ],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: ["<rootDir>"],
};
