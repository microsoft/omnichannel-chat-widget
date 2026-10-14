module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: [
        "./jest.setup.visual.cjs"
    ],
    testRegex: "(\\.|/)(visual.test|visual.spec)\\.[jt]sx?$",
    verbose: true,
    reporters: [
        "default"
    ],
    moduleNameMapper: {
        "^@typespec/ts-http-runtime/internal/logger$": "<rootDir>/node_modules/@typespec/ts-http-runtime/dist/commonjs/logger/internal.js",
        "^@typespec/ts-http-runtime/internal/policies$": "<rootDir>/node_modules/@typespec/ts-http-runtime/dist/commonjs/policies/internal.js",
        "^@typespec/ts-http-runtime/internal/util$": "<rootDir>/node_modules/@typespec/ts-http-runtime/dist/commonjs/util/internal.js"
    },
    collectCoverage: false,
    maxWorkers: 1
};