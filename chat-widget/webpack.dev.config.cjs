// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
    devtool: "source-map",
    entry: "./sample/SampleWidget.js",
    mode: "development",
    output: {
        filename: "out.js"
    },
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx"]
    },
    devServer: {
        static: {
            directory: path.join(__dirname, "public"),
        },
        compress: true,
        port: 9000,
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env"],
                        plugins: ["@babel/plugin-syntax-dynamic-import"]
                    }
                }
            }
        ]
    }
};