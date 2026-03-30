/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./samples/javascript-sample/LiveChatBootstrapper.js",
    mode: "production",
    output: {
        filename: "out.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/",
    },
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx", ".mjs"],
        alias: {
            // Ensure a SINGLE instance of chat-components (and its BroadcastService) across
            // both the bootstrapper imports (../../lib/esm/...) and the widget internals.
            // Without this, webpack bundles two separate BroadcastService singletons and
            // events posted by the bootstrapper never reach the widget's subscriptions.
            "@microsoft/omnichannel-chat-components": path.resolve(__dirname, "node_modules/@microsoft/omnichannel-chat-components"),
            "@microsoft/omnichannel-chat-sdk": path.resolve(__dirname, "node_modules/@microsoft/omnichannel-chat-sdk"),
            "react": path.resolve(__dirname, "node_modules/react"),
            "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
            "swiper/modules": require.resolve("swiper/swiper.esm.js"),
            // botframework-webchat-component needs @emotion/css@11 (with create-instance subpath),
            // but the project root has @emotion/css@10. Pin to webchat's nested copy.
            "@emotion/css": path.resolve(__dirname, "node_modules/botframework-webchat-component/node_modules/@emotion/css"),
            // sanitize-html needs is-plain-object@5 (named export), but root has v2 (default export)
            "is-plain-object": path.resolve(__dirname, "node_modules/sanitize-html/node_modules/is-plain-object"),
            // lib/esm/common/utils.js has require("../../package.json") which resolves to
            // lib/package.json (doesn't exist). Redirect to the actual package.json at root.
            [path.resolve(__dirname, "lib/package.json")]: path.resolve(__dirname, "package.json"),
            // Webpack 4 does not support package.json "exports" subpath resolution.
            // Manually map @typespec/ts-http-runtime subpaths to their browser builds.
            "@typespec/ts-http-runtime/internal/util": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/util/internal.js"),
            "@typespec/ts-http-runtime/internal/logger": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/logger/internal.js"),
            "@typespec/ts-http-runtime/internal/policies": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/policies/internal.js"),
            "@typespec/ts-http-runtime": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/index.js")
        },
        modules: [
            path.resolve(__dirname, "node_modules"),
            "node_modules"
        ]
    },
    cache: {
        type: "filesystem",
    },
    devtool: "eval-cheap-source-map",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ parallel: true })],
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                // Do NOT run babel on pre-bundled botframework-webchat dist files —
                // double-transpiling breaks their _interopRequireDefault helpers
                // and causes "Cannot read properties of undefined (reading 'call')"
                exclude: /node_modules[\\/]botframework-webchat[^\\/]*[\\/]dist/,
                type: "javascript/auto",
                use: [
                    "thread-loader",
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [["@babel/preset-env", {
                                exclude: ["@babel/plugin-transform-classes"]
                            }]],
                            plugins: [
                                "@babel/plugin-transform-class-properties",
                                "@babel/plugin-transform-private-methods",
                                "@babel/plugin-transform-private-property-in-object"
                            ],
                            cacheDirectory: true
                        }
                    }
                ]
            }
        ]
    }
};
