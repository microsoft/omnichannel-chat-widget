module.exports = {
    setupFilesAfterEnv: [
        "./jest.setup.visual.js"
    ],
    testRegex: "(/__tests__/.*|(\\.|/)(visual.test|visual.spec))\\.[jt]sx?$"
};