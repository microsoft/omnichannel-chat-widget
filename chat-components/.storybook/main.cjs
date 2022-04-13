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
  ]
}