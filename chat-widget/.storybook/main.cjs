const path = require('path');

module.exports = {
  "stories": [
    "../src/**/*.stories.tsx"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    '@storybook/addon-a11y',
    "@storybook/addon-webpack5-compiler-babel",
    "@chromatic-com/storybook"
  ],
  "framework": {
    "name": "@storybook/react-webpack5",
    "options": {}
  },
  // Disable telemetry to prevent RangeError: Invalid string length in CI
  "core": {
    "disableTelemetry": true
  },
  "webpackFinal": async (config, { configType }) => {
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          compact: false // Suppress "deoptimised" warnings for large files
        }
      }
    });

    // Fix swiper ESM exports issue - redirect all swiper imports to the bundle
    const swiperPath = path.resolve(__dirname, '../node_modules/swiper');
    config.resolve.alias = {
      ...config.resolve.alias,
      'swiper/modules': path.join(swiperPath, 'swiper-bundle.esm.js'),
      'swiper/css': path.join(swiperPath, 'swiper.min.css'),
      'swiper': path.join(swiperPath, 'swiper-bundle.esm.js'),
    };

    // Return the altered config
    return config;
  },
}