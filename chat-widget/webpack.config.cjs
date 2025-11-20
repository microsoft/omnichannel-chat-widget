/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./samples/javascript-sample/SampleWidget.js",
    mode: "production",
    output: {
        filename: "out.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/chat-widget/dist/",
    },
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx"],
        alias: {
            "@typespec/ts-http-runtime/internal/logger": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/logger/internal.js"),
            "@typespec/ts-http-runtime/internal/policies": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/policies/internal.js"),
            "@typespec/ts-http-runtime/internal/util": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/util/internal.js")
        }
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
