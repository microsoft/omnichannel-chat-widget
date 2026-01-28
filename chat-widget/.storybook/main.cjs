const path = require('path');
const webpack = require('webpack');

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
    // Helper to get package directory
    const getPkgDir = (pkgName) => {
      try {
        return path.dirname(require.resolve(`${pkgName}/package.json`, {
          paths: [path.resolve(__dirname, '..')]
        }));
      } catch (e) {
        // Silently skip packages that aren't installed
        return null;
      }
    };

    // 1) Expand RN transpile include list
    const rnDeps = [
      "react-native-web",
      "react-native-gesture-handler",
      "react-native-reanimated",
      "react-native-safe-area-context",
      "react-native-screens",
      "react-native-svg",
      "@react-native/normalize-colors",
      "@react-native/assets",
      "@react-native/virtualized-lists",
      "@react-native-community/masked-view",
      "@react-native-async-storage/async-storage",
      "@react-native-picker/picker",
      // Internal packages that depend on RN
      "@microsoft/omnichannel-chat-components",
    ];
    const rnDepDirs = rnDeps.map(getPkgDir).filter(Boolean);

    // 2) Add RN internal alias shims + react-native-web alias
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": "react-native-web",
      "react-native/Libraries/Renderer/shims/ReactNativePropRegistry":
        "react-native-web/dist/modules/ReactNativePropRegistry",
      "react-native/Libraries/Utilities/Platform":
        "react-native-web/dist/exports/Platform",
      "react-native/Libraries/StyleSheet/StyleSheet":
        "react-native-web/dist/exports/StyleSheet",
    };

    // Add web-first extensions
    config.resolve.extensions = [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      ...config.resolve.extensions
    ];

    // Set mainFields for web resolution
    config.resolve.mainFields = ['browser', 'module', 'main'];

    // 3) Separate rules for src vs RN deps
    // Rule for src: standard React/TypeScript transpilation
    config.module.rules.push({
      test: /\.[jt]sx?$/,
      include: [path.resolve(__dirname, '../src')],
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }],
            '@babel/preset-react',
            '@babel/preset-typescript'
          ],
          cacheDirectory: true
        }
      }
    });

    // 4) Rule for RN deps: metro preset + react-native-web plugin
    if (rnDepDirs.length > 0) {
      config.module.rules.push({
        test: /\.[jt]sx?$/,
        include: rnDepDirs,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['module:metro-react-native-babel-preset'],
            plugins: ['babel-plugin-react-native-web'],
            cacheDirectory: true
          }
        }
      });
    }

    // Additional packages with modern JS syntax (not RN-specific)
    // Added due to webpack4 parse failures
    // Note: Using predicate function to handle nested node_modules
    const modernJsDeps = [
      "micromark-util-decode-numeric-character-reference",  // numeric separators
      "micromark-util-sanitize-uri",                        // numeric separators
      "web-speech-cognitive-services",                      // private fields
      "iter-fest",                                          // private fields
      "event-as-promise",                                   // private fields
      "react-dictate-button",                               // nullish coalescing
      "mime",                                               // optional chaining
      "htmlparser2",                                        // optional chaining
      "valibot",                                            // optional chaining
      "microsoft-cognitiveservices-speech-sdk",             // optional chaining
    ];

    config.module.rules.push({
      test: /\.[jt]sx?$/,
      include: (filepath) => {
        // Handle nested node_modules - check if path contains any modern JS dep
        if (filepath.includes('node_modules')) {
          const normalizedPath = filepath.replace(/\\/g, '/');
          return modernJsDeps.some(pkg => {
            return normalizedPath.includes('/node_modules/' + pkg + '/');
          });
        }
        return false;
      },
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }]
          ],
          cacheDirectory: true
        }
      }
    });

    // 6) Handle .mjs files with modern syntax
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            ['@babel/preset-env', { targets: { browsers: ['last 2 versions'] } }]
          ],
          cacheDirectory: true
        }
      }
    });

    // 7) Add webpack plugins
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(true),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
      })
    );

    // Return the altered config
    return config;
  },
}