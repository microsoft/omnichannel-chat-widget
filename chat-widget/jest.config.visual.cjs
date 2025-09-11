module.exports = {
    setupFilesAfterEnv: [
        "./jest.setup.visual.js"
    ],
    testRegex: "(\\.|/)(visual.test|visual.spec)\\.[jt]sx?$",
    verbose: true,
    reporters: [
        "default"
    ],
    collectCoverage: false,
    maxWorkers: 1
};