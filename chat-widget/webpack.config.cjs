/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
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
    cache: { // enforcing caching to avoid re build for unchanged files
        type: "filesystem",
    },
    devtool: "eval-cheap-source-map", // this is the fastest source map option for development
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ parallel: true })], // this trick is to build faster
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
              
                use: [
                    "thread-loader", // the idea is to use any core possible to divide the build
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            cacheDirectory: true
                        }
                    }]
            }
        ]
    }
};