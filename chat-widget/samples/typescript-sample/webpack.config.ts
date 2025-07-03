import path from "path";
import { Configuration, NormalModuleReplacementPlugin } from "webpack";
import * as webpack from "webpack";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as webpackDevServer from "webpack-dev-server";

const disableFullyQualifiedNameResolutions = {
    test: /\.m?js$/,
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
            crypto: path.resolve(__dirname, "crypto-polyfill.js"),
            stream: require.resolve("stream-browserify"),
            vm: require.resolve("vm-browserify"),
            path: require.resolve("path-browserify"),
            http: require.resolve("stream-http"),
            https: require.resolve("https-browserify"),
            zlib: require.resolve("browserify-zlib"),
            url: require.resolve("url"),
            buffer: require.resolve("buffer"),
            util: require.resolve("util"),
            os: require.resolve("os-browserify/browser"),
            fs: false,
            net: false,
            tls: false
        },
        conditionNames: ["import", "require", "node", "default"],
        mainFields: ["browser", "module", "main"],
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
            process: "process/browser.js",
            Buffer: ["buffer", "Buffer"],
        }),
        new NormalModuleReplacementPlugin(/^node:/, (resource) => {
            const moduleRequest = resource.request.replace(/^node:/, "");
            const polyfillMap: Record<string, string> = {
                crypto: path.resolve(__dirname, "crypto-polyfill.js"),
                stream: "stream-browserify",
                path: "path-browserify",
                url: "url",
                buffer: "buffer",
                util: "util",
                os: "os-browserify/browser",
                zlib: "browserify-zlib",
                http: "stream-http",
                https: "https-browserify",
                assert: "assert",
                process: "process/browser.js",
            };
            
            if (polyfillMap[moduleRequest]) {
                resource.request = polyfillMap[moduleRequest];
            } else {
                // For modules we can't polyfill, replace with empty module
                resource.request = "data:text/javascript,module.exports = {}";
            }
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