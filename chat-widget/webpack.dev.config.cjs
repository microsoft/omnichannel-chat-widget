// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
    devtool: "source-map",
    entry: "./samples/javascript-sample/SampleWidget.js",
    mode: "development",
    output: {
        filename: "out.js"
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
    optimization: {
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"]
                    }
                }
            }
        ]
    }
};
