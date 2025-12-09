const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "CCaaSChatGPTWidget.js",
    clean: true
  },
  devtool: 'eval-source-map',
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        exclude: /node_modules/,
        use: "babel-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.json$/,
        type: 'asset/resource',
        generator: {
          filename: 'data/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
      inject: "body"
    })
  ],
  devServer: {
    static: [
      {
        directory: path.resolve(__dirname, "src"),
        publicPath: '/'
      }
    ],
    port: 3000,
    open: true,
    hot: true
  }
};
