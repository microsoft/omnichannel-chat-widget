/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    devtool: "source-map",
    entry: "./samples/javascript-sample/SampleWidget.js",
    mode: "production",
    output: {
        filename: "out.js"
    },
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx"]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 9000,
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};