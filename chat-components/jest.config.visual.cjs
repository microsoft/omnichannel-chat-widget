module.exports = {
    testEnvironment: "node",
    setupFilesAfterEnv: [
        "./jest.setup.visual.cjs"
    ],
    testRegex: "(/__tests__/.*|(\\.|/)(visual.test|visual.spec))\\.[jt]sx?$",
    moduleNameMapper: {
        "^swiper/modules$": "<rootDir>/node_modules/swiper/modules/index.mjs",
        "^swiper$": "<rootDir>/node_modules/swiper/swiper.mjs"
    }
};