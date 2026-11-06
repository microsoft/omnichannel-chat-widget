// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
const webpack = require("webpack");

module.exports = {
    devtool: "source-map",
    entry: "./samples/javascript-sample/SampleWidget.js",
    mode: "development",
    output: {
        filename: "out.js"
    },
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx", ".mjs"],
        alias: {
            "swiper/modules": require.resolve("swiper/modules"),
            "react-native": false
        }
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 9000,
    },
    optimization: {
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.m?js$/,
                type: "javascript/auto",
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.IgnorePlugin({
            resourceRegExp: /^react-native$/,
        })
    ]
};
