import path from "path";
import { Configuration } from "webpack";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as webpackDevServer from "webpack-dev-server";

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
            stream: require.resolve("stream-browserify")
        },
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
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