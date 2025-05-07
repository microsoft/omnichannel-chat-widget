/**
 * This config is used to build a version of of the widget that can be loaded in
 * the browser using a <script> tag, and once it's loaded, it gives you access
 * to the LiveChatWidget react component under
 * window.LiveChatWidget.LiveChatWidget
 *
 * So instead of including the LiveChatWidget react component in your app, you
 * can load it externally, and still use it as a React component.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const webpack = require("webpack");

const babelLoaderConfiguration = {
    test: /\.(ts|js)x?$/,
    use: {
        loader: "babel-loader",
        options: {
            presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
            ]
        },
    },
};

module.exports = {
    mode: "production",
    entry: "./src/index.ts",
    externals: {
        react: "React",
        reactdom: "ReactDOM",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js", ".jsx", ".json"],
        alias: {
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            vm: require.resolve("vm-browserify"),
        },
    },
    module: {
        rules: [babelLoaderConfiguration]
    },
    output: {
        path: path.resolve(__dirname, "lib", "umd"),
        filename: "out.js",
        /**
         * Library determines the package name in the global window. So, in this
         * example, after this script is loaded by the browser, we can access
         * LiveChatWidget under window.LiveChatWidget.LiveChatWidget
         */
        library: "LiveChatWidget",
        libraryTarget: "umd",
        globalObject: "this"
    },
    plugins: [
        new webpack.IgnorePlugin(/^react-native$/),
        new webpack.ProvidePlugin({
            process: "process/browser",
        }),
    ],
};
