/* eslint-disable @typescript-eslint/no-unused-vars */

import * as webpack from "webpack";
import * as webpackDevServer from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";

import { Configuration } from "webpack";
import path from "path";

// eslint-disable-next-line @typescript-eslint/no-unused-vars


const disableFullyQualifiedNameResolutions = {
    test: /\.m?js/,
    resolve: {
        fullySpecified: false,
    },
};

const babelLoaderConfiguration = {
    test: /\.(ts|js)x?$/,
    exclude: /node_modules/,
    use: {
        loader: "babel-loader",
        options: {
            presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
            ],
        },
    }
};

const config: Configuration = {
    entry: "./src/index.tsx",
    mode: "development",
    module: {
        rules: [
            babelLoaderConfiguration,
            disableFullyQualifiedNameResolutions
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        fallback: {
            assert: require.resolve("assert"),
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            vm: require.resolve("vm-browserify"),
            path: require.resolve("path-browserify"),
            os: require.resolve("os-browserify/browser"),
            fs: false,
            module: false,
        },
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^react-native$/
        }),
        new webpack.ProvidePlugin({
            process: "process/browser",
            Buffer: ["buffer", "Buffer"],
        }),
        new webpack.DefinePlugin({
            global: "globalThis",
        }),
        new HtmlWebpackPlugin({
            template: "./src/template.html",
            filename: "index.html",
            inject: true,
        }),
    ],
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 4000,
        open: "chrome",
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        }
    },
};

export default config;