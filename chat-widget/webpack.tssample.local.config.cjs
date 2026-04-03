/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
    entry: "./samples/typescript-sample/src/index.tsx",
    mode: "production",
    output: {
        filename: "ts-out.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".Webpack.js", ".web.js", ".js", ".jsx", ".mjs"],
        alias: {
            // Local lib alias — resolve @microsoft/omnichannel-chat-widget to local build
            "@microsoft/omnichannel-chat-widget/package.json": path.resolve(__dirname, "package.json"),
            "@microsoft/omnichannel-chat-widget$": path.resolve(__dirname, "lib/esm/index.js"),
            "@microsoft/omnichannel-chat-widget": path.resolve(__dirname, "lib/esm"),
            // Ensure a SINGLE instance of shared packages
            "@microsoft/omnichannel-chat-components/package.json": path.resolve(__dirname, "../chat-components/package.json"),
            "@microsoft/omnichannel-chat-components$": path.resolve(__dirname, "../chat-components/lib/esm/index.js"),
            "@microsoft/omnichannel-chat-components": path.resolve(__dirname, "../chat-components/lib/esm"),
            "@microsoft/omnichannel-chat-sdk": path.resolve(__dirname, "node_modules/@microsoft/omnichannel-chat-sdk"),
            "react": path.resolve(__dirname, "node_modules/react"),
            "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
            "react-native$": "react-native-web",
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
            "@typespec/ts-http-runtime": path.resolve(__dirname, "node_modules/@typespec/ts-http-runtime/dist/browser/index.js"),
        },
        modules: [
            path.resolve(__dirname, "node_modules"),
            "node_modules"
        ]
    },
    // Webpack 4 uses filesystem caching via cache-loader or babel-loader cacheDirectory
    node: {
        crypto: true,
        stream: true,
    },
    devtool: "eval-cheap-source-map",
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({ parallel: true })],
    },
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                // Do NOT run babel on pre-bundled botframework-webchat dist files —
                // double-transpiling breaks their _interopRequireDefault helpers
                exclude: [
                    /node_modules[\\/]botframework-webchat[^\\/]*[\\/]dist/,
                    /node_modules/
                ],
                use: [
                    "thread-loader",
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-env", {
                                    exclude: ["@babel/plugin-transform-classes"]
                                }],
                                "@babel/preset-react",
                                "@babel/preset-typescript",
                            ],
                            plugins: [
                                "@babel/plugin-transform-class-properties",
                                "@babel/plugin-transform-private-methods",
                                "@babel/plugin-transform-private-property-in-object",
                            ],
                            cacheDirectory: true
                        }
                    }
                ]
            },
            {
                test: /\.m?js$/,
                // Do NOT run babel on pre-bundled botframework-webchat dist files
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
