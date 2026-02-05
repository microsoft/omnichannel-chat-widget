
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
        "^swiper/modules$": "swiper",
        "^swiper$": "<rootDir>/node_modules/swiper/swiper.esm.js"
    },
    setupFiles: ["./jest.setup.js"]

};