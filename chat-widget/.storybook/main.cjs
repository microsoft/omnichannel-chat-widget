module.exports = {
  "stories": [
    "../src/**/*.stories.tsx"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    '@storybook/addon-a11y',
    '@storybook/addon-knobs',
    'storybook-addon-playwright/preset',
    'storybook-addon-playwright/register'
  ],
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
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules\/valibot/,
      type: "javascript/auto",
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    });

    // config.resolve.modules = ["node_modules", path.resolve(__dirname, "../src")];

    // Return the altered config
    return config;
  },
}