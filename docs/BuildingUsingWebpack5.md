# Using LiveChatWidget in React + TypeScript + Webpack 5
This guide is intented to help you getting started with `<LiveChatWidget />` in a react application using Webpack 5, TypeScript. 

> Explaining features/options used below for [react](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Webpack](https://webpack.js.org/), [Babel](https://babeljs.io/) are out of scope of this document. Please refer to these open sources official documents for getting more details.

### Steps:
#### 1: Setting up app

Let’s create the following folders in a root folder:

`dist`: This folder will contain all the artifacts from the build output. This will also hold the HTML page where the React app will be injected to.
`src`: This will contain source codes.

#### 2: Adding `package.json`
In the root of the project, add the following package.json. You can also use `npm init` command to create it.

```
{
  "name": "my-sample-widget",
  "version": "0.0.1"
}
```

#### 3. Add `index.html`
Let’s also add the following index.html file into the `dist` folder. Note the `bundle.js`, this JavaScript file will be created after building the react app and will be placed inside `dist` folder.

```
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8" />
</head>

<body>
    <div id="root"></div>
    <script src="bundle.js"></script>
</body>

</html>
```

#### 4. Adding `React` and `TypeScript`
Run the following commands from a command prompt from root folder:
```
npm install react react-dom
```

```
npm install --save-dev typescript
```
```
npm install --save-dev @types/react @types/react-dom
```

#### 5. Add `tsconfig.json`
TypeScript is configured with a file called `tsconfig.json`. Let’s create this file in the root of our project with the following content:
```
{
    "compilerOptions": {
      "lib": ["dom", "dom.iterable", "esnext"],
      "allowJs": true,
      "allowSyntheticDefaultImports": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "strict": true,
      "forceConsistentCasingInFileNames": true,
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react"
    },
    "include": ["src"]
  }
```

#### 6. Add a root component
Create a simple React component in a `index.tsx` file in the src folder. This will eventually be displayed in `index.html`.

```
import React from "react";
import ReactDOM from "react-dom";

const App = () => (
  <h1>My Sample app!</h1>
);

ReactDOM.render(
  <App />,
  document.getElementById("root")
);
```

#### 7. Add `Babel`
```
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-transform-runtime @babel/runtime
```

#### 8. Configuring `Babel`
We'll configure the `babel` in `.babelrc` file. Create this file under root directory.
```
{
    "presets": [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-typescript"
    ],
    "plugins": [
      [
        "@babel/plugin-transform-runtime",
        {
          "regenerator": true
        }
      ]
    ]
  }
```

#### 9. Add `Webpack` and tools
[Webpack](https://webpack.js.org/) is a bundler tool that can be use to bundle all JavaScript code into the bundle.js file that is used in `index.html`. 

Install webpack and webpack command line tools:
```
npm install --save-dev webpack webpack-cli @types/webpack
```

Webpack also have a web server that can be used during development. To install:
```
npm install --save-dev webpack-dev-server @types/webpack-dev-server
```

`babel-loader ` will help to transpile react + TypeScript code to JavaScript. To install:
```
npm install --save-dev babel-loader
```
`Webpack` configuration file is JavaScript based as standard, however we can TypeScript as well. To do this use `ts-node`.
```
npm install --save-dev ts-node
```

#### 10. webpack.config.ts
`Webpack` is configured through a configuration file. Create this file in root directory
```
import path from "path";
import { Configuration } from "webpack";
import * as webpack from 'webpack';
import * as webpackDevServer from 'webpack-dev-server';

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
        loader: "babel-loader",
        options: {
            presets: [
                "@babel/preset-env",
                "@babel/preset-react",
                "@babel/preset-typescript",
            ],
        },
    }
};

const config: Configuration = {
    entry: "./src/index.tsx",
    mode: "development",
    module: {
        rules: [
            babelLoaderConfiguration,
            disableFullyQualifiedNameResolutions
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    devServer: {
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 4000,
        client: {
            overlay: {
                warnings: false,
                errors: true
            }
        }
    },
};

export default config;
```
#### 11. Add npm scripts
To `build` and `run` add below scripts to `package.json`
```
...,
  "scripts": {
    "start": "webpack serve --open",
    "build": "webpack --mode development", //Adjust mode(development/production) as needed
  },
  ...
```
#### 12. Verify the sample app
Verify the below folder structure after `npm run build`
![](https://i.imgur.com/MppuKLQ.png)

Try running the app using `npm run start`, you should see a sample page opened in your default browser

After this step, we'll proceed for adding Omnichannel LCW packages

#### 13. [Omnichannel Live Chat Widget UI Components](https://github.com/microsoft/omnichannel-chat-widget) installation

```
npm i @microsoft/omnichannel-chat-sdk
```
```
npm i @microsoft/omnichannel-chat-widget --legacy-peer-deps
```
#### 14. Adding `<LiveChatWidget />` to index.tsx
```
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { LiveChatWidget } from "@microsoft/omnichannel-chat-widget";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const getOmnichannelChatConfig = () => {
    // add your own OC setting, hard-coded just for sample, should be replaced with a better handling
    const omnichannelConfig = { 
        orgId: "",
        orgUrl: "",
        widgetId: ""
    };
    return omnichannelConfig;
}

const App = () => {
    const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<any>();

    useEffect(() => {
        const init = async () => {
            const omnichannelConfig = getOmnichannelChatConfig();

            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            await chatSDK.initialize();
            const chatConfig = await chatSDK.getLiveChatConfig();

            const liveChatWidgetProps = {
                styleProps: {
                    generalStyles: {
                        width: "400px",
                        height: "600px",
                        bottom: "30px",
                        right: "30px"
                    }
                },
                chatSDK,
                chatConfig,
                webChatContainerProps:{
                    disableMarkdownMessageFormatting : true, //setting the default to true for a known issue with markdown
                }
            };

            setLiveChatWidgetProps(liveChatWidgetProps);
        }

        init();
    }, []);

    return (
        <div>
            {liveChatWidgetProps && <LiveChatWidget {...liveChatWidgetProps} />}
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.getElementById("root")
);
```

#### 15. [Sample app](https://github.com/microsoft/omnichannel-chat-widget/tree/main/chat-widget/samples/typescript-sample)
