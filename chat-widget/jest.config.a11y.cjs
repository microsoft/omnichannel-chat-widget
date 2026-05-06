module.exports = {
    testRunner: "jest-jasmine2",
    testEnvironment: "jsdom",
    testMatch: [
        "**/*.a11y.spec.ts",
        "**/*.a11y.spec.tsx",
        "**/*.a11y.test.ts",
        "**/*.a11y.test.tsx"
    ],
    testPathIgnorePatterns: [
        "automation_tests",
        "/node_modules/"
    ],
    transformIgnorePatterns: [],
    transform: {
        "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
        ".+\\.(css|scss|png|jpg|svg|gif)$": "jest-transform-stub"
    },
    moduleNameMapper: {
        "^swiper/modules$": "swiper",
        "^swiper$": "<rootDir>/node_modules/swiper/swiper.esm.js"
    },
    setupFilesAfterEnv: ["./jest.setup.a11y.js"],
    passWithNoTests: true
};
