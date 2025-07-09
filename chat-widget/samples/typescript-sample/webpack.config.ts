const path = require('path');

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
    loader: 'babel-loader',
    options: {
      presets: [
        '@babel/preset-env',
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    },
  },
};

module.exports = {
  entry: './src/index.tsx',
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      disableFullyQualifiedNameResolutions,
    ],
  },
  externals: {
    "react-native": true,
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      assert: require.resolve('assert'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    },
    alias: {
     'react-native$': 'react-native-web'
   },
  },
};