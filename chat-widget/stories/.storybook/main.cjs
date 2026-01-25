// Determine if we're in build mode (build-storybook) vs dev mode
// storybook-addon-playwright has webpack5 incompatibilities during build
const isBuildMode = process.argv.includes('build-storybook') || process.env.STORYBOOK_BUILD_MODE === 'true';
const path = require('path');

const addons = [
  "@storybook/addon-links",
  "@storybook/addon-essentials",
  "@storybook/addon-a11y",
  "@storybook/addon-knobs",
];

// Only include playwright addon when not in build mode (for VRT during dev/test)
if (!isBuildMode) {
  addons.push('storybook-addon-playwright/preset');
  addons.push('storybook-addon-playwright/register');
}

module.exports = {
  "stories": [
    "../*.stories.tsx",
    "../**/*.stories.tsx"
  ],
  "addons": addons,
  // Use Webpack 5 builder for better ESM support and package.json exports resolution
  "core": {
    "builder": "@storybook/builder-webpack5",
    "disableTelemetry": true
  },
  "webpackFinal": async (config, { configType }) => {
    config.module.rules.push({
      test: /\.(js|jsx)$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    });

    // Disable strict ESM resolution for all modules (needed when "type": "module" is in package.json)
    // This allows imports without file extensions
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    // Fix swiper ESM exports issue - redirect all swiper imports to the bundle
    const swiperPath = path.resolve(__dirname, '../../node_modules/swiper');
    config.resolve.alias = {
      ...config.resolve.alias,
      'swiper/modules': path.join(swiperPath, 'swiper-bundle.esm.js'),
      'swiper/css': path.join(swiperPath, 'swiper.min.css'),
      'swiper': path.join(swiperPath, 'swiper-bundle.esm.js'),
    };
    
    // Ensure proper extension resolution
    config.resolve.extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'];

    // config.resolve.modules = ["node_modules", path.resolve(__dirname, "../../src")];

    // Return the altered config
    return config;
  }
}