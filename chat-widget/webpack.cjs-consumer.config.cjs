const path = require("node:path");
const baseConfig = require("./webpack.umd.config.cjs");

module.exports = {
    ...baseConfig,
    entry: "./lib/cjs/index.js",
    output: {
        ...baseConfig.output,
        path: path.resolve(__dirname, "node_modules", ".cache", "cjs-consumer"),
        filename: "out.js"
    }
};
