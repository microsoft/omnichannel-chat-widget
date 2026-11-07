/* eslint-disable @typescript-eslint/no-var-requires */
const base = require("./jest.config");

process.env.LCW_TOKEN_RECOVERY_E2E = "1";

module.exports = {
    ...base,
    preset: undefined,
    testEnvironment: "node",
    setupFilesAfterEnv: [],
    globals: {
        "ts-jest": { tsConfig: "tsconfig.token-recovery.json" }
    },
    testMatch: ["**/e2e/areas/recovery/chatTokenRecovery.spec.ts"],
    testPathIgnorePatterns: base.testPathIgnorePatterns.filter(pattern => pattern !== "/e2e/areas/recovery/"),
    testResultsProcessor: undefined,
    reporters: ["default"],
    testTimeout: 240000
};
