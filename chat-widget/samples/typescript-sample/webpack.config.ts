
import path from "path";
import type { Configuration } from "webpack";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
        alias: {
            "react-native$": "react-native-web"
        },
        fallback: {
            assert: "assert",
            crypto: "crypto-browserify",
            stream: "stream-browserify"
        },
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    // plugins: [
    //     new CopyWebpackPlugin({
    //         patterns: [
    //             {
    //                 from: path.resolve(__dirname, "public"),
    //                 to: path.resolve(__dirname, "dist"),
    //             },
    //         ],
    //     }),
    // ]
};

export default config;
