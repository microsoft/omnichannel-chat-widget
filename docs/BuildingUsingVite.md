# Using LiveChatWidget with Vite


## Getting Started

### 1. Scaffold Vite Project

```
npm create vite@latest vite-sample --template react-ts
```

You can look at [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) for more template options

### 2. Install Vite dependencies 

```
cd vite-sample
npm install
```

### 3. Install [@microsoft/omnichannel-chat-widget](https://www.npmjs.com/package/@microsoft/omnichannel-chat-widget) package

```
npm install @microsoft/omnichannel-chat-widget
```

### 4. Update vite.config.ts

```js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@microsoft/botframework-webchat-adapter-azure-communication-chat': path.resolve(__dirname, 'node_modules', '@microsoft', 'botframework-webchat-adapter-azure-communication-chat', 'dist', 'chat-adapter.js'),
      '@microsoft/botframework-webchat-adapter-azure-communication-chat/package.json': path.resolve(__dirname, 'node_modules', '@microsoft', 'botframework-webchat-adapter-azure-communication-chat', 'package.json'),
      '@fluentui/react': path.resolve(__dirname, 'node_modules', '@microsoft', 'omnichannel-chat-components', 'node_modules', '@fluentui', 'react')
    }
  }
});
```

### 5. Start Vite

```
npm run dev
```

App is running on http://localhost:5173/

### 6. Add Code to Render LiveChatWidget Component

```ts
import { useEffect, useState } from 'react';
import { ILiveChatWidgetProps } from "@microsoft/omnichannel-chat-widget/lib/types/components/livechatwidget/interfaces/ILiveChatWidgetProps";
import { OmnichannelChatSDK } from '@microsoft/omnichannel-chat-sdk';
import { LiveChatWidget } from '@microsoft/omnichannel-chat-widget';
import './App.css';

function App() {
  const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<ILiveChatWidgetProps>();

  useEffect(() => {
    const omnichannelChatConfig = {
      orgId: '',
      orgUrl: '',
      widgetId: ''
    };

    const init = async () => {
      const chatSDK = new OmnichannelChatSDK(omnichannelChatConfig);
      const chatConfig = await chatSDK.initialize();
      const liveChatWidgetProps = {
        styleProps: {
          generalStyles: {
            bottom: "20px",
            right: "20px",
            width: "360px",
            height: "560px"
          }
        },
        headerProps: {
          styleProps: {
            generalStyleProps: {
              height: "70px"
            }
          }
        },
        chatSDK,
        chatConfig
      };
      setLiveChatWidgetProps(liveChatWidgetProps);
    };

    init();
  }, []);

  return (
    <>
      <h1>Vite + Omnichannel Chat Widget</h1>
      <div>
        {liveChatWidgetProps && <LiveChatWidget {...liveChatWidgetProps} />}
      </div>
    </>
  )
}

export default App;
```

Happy Coding!