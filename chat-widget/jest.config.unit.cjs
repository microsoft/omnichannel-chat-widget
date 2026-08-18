
module.exports = {
    //Adding jasmine testRunner for issue with fail method in unit tests: https://github.com/facebook/jest/issues/11698
    testRunner: "jest-jasmine2",
    testPathIgnorePatterns: [
        "(/__tests__/.*|(\\.|/)(visual.test|visual.spec))\\.[jt]sx?$",
        "automation_tests"
    ],
    "transformIgnorePatterns": [],
    "transform": {
        "^.+\\.(js|jsx|ts|tsx|mjs)$": "babel-jest",
        ".+\\.(css|scss|png|jpg|svg|gif)$": "jest-transform-stub"
    },
    "moduleNameMapper": {
        "^swiper/modules$": "<rootDir>/node_modules/swiper/modules/index.mjs",
        "^swiper$": "<rootDir>/node_modules/swiper/swiper.mjs",
        "^@typespec/ts-http-runtime/internal/logger$": "<rootDir>/node_modules/@typespec/ts-http-runtime/dist/commonjs/logger/internal.js",
        "^@typespec/ts-http-runtime/internal/policies$": "<rootDir>/node_modules/@typespec/ts-http-runtime/dist/commonjs/policies/internal.js",
        "^@typespec/ts-http-runtime/internal/util$": "<rootDir>/node_modules/@typespec/ts-http-runtime/dist/commonjs/util/internal.js"
    },
    setupFiles: ["./jest.setup.js"]

};
