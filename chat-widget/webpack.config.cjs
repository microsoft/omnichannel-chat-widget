/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");


module.exports = function (env, argv) {

    const TSCONFIG_FILE = "tsconfig.json";

    return {
        devtool: "source-map",
        entry: "./samples/javascript-sample/SampleWidget.js",
        mode: "production",
        output: {
            path: path.resolve(__dirname, "dist"), // Define the output path
            filename: "out.js"
        },
        resolve: {
            extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx"],
            fallback: {
                crypto: require.resolve("crypto-browserify"),
                stream: require.resolve("stream-browserify")
            }
        },
        cache: {
            type: "filesystem",
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin({
                typescript: {
                    configFile: path.resolve(__dirname, TSCONFIG_FILE),
                    memoryLimit: 8192
                }
            }),
            new CleanWebpackPlugin()
        ],
        devServer: {
            static: {
                directory: path.join(__dirname, "public"),
            },
            compress: true,
            port: 9000,
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin({ parallel: true })],
            usedExports: true,
            sideEffects: true,
            innerGraph: true,

        },
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                    use: [

                        {
                            loader: "thread-loader",
                            options: {
                                workers: 2,
                            },
                        },
                        {
                            loader: "babel-loader",
                            options: {
                                cacheDirectory: true,
                                presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"]
                            }
                        }]
                }
            ]
        }
    };
};