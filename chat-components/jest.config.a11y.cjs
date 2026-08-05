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
        "/node_modules/",
        "(/__tests__/.*|(\\.|/)(visual\\.test|visual\\.spec))\\.[jt]sx?$",
        "/visual\\.test\\.[jt]sx?$"
    ],
    transformIgnorePatterns: [
        "/!node_modules\\/lodash-es/"
    ],
    transform: {
        "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
        ".+\\.(css|scss|png|jpg|svg|gif)$": "jest-transform-stub"
    },
    moduleNameMapper: {
        "^swiper/modules$": "<rootDir>/node_modules/swiper/modules/index.mjs",
        "^swiper$": "<rootDir>/node_modules/swiper/swiper.mjs"
    },
    setupFilesAfterEnv: ["./jest.setup.a11y.js"],
    passWithNoTests: true
};
