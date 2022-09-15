/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const _optimization = {
    minimize: true,
    minimizer: [new TerserPlugin()],
    runtimeChunk: 'single',
    splitChunks: {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
            vendor: {
                test: /[\\/]node_modules[\\/]/,
                name(module) {
                    // node_modules/packageName/not/this/part.js or node_modules/packageName
                    const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                    // npm package names are URL-safe, but some servers don't like @ symbols
                    return `npm.${packageName.replace('@', '')}`;
                },
            },
        },
    }
};

const _module = {
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
};

const _devServer = {
    static: {
        directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
};

const _plugins = [
    new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
        title: "Sample App from webpack",
        template: './sample/template.html',
        filename: 'test1.html', //relative to root of the application
        inject: 'head'
    })
];

module.exports = {
    //devtool: "source-map",
    entry: "./sample/SampleWidget.js",
    mode: "production",
    output: {
        filename: "[name].js"
    },
    plugins: _plugins,
    resolve: {
        extensions: [".Webpack.js", ".web.js", ".ts", ".js", ".jsx", ".tsx"]
    },
    devServer: _devServer,
    optimization: _optimization,
    module: _module,
};