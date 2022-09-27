import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { LiveChatWidget } from "@microsoft/omnichannel-chat-widget";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Md5 } from "md5-typescript";

const getOmnichannelChatConfig = () => {
    // add your own OC setting, hard-coded just for sample, should be replaced with a better handling
    const omnichannelConfig = {
        orgId: "bfd9d87a-79b7-4bb7-acf0-48b3b855b4da",
        orgUrl: "https://orgf4d9cd3e-crm.omnichannelengagementhub.com",
        widgetId: "494bacd8-9314-48bf-bfc2-c13779923cf3"
    };
    return omnichannelConfig;
};

const getWidgetCacheId = (widgetId: string, orgId: string, widgetinstanceId?: string): string => {
    const widgetCacheId = `${widgetinstanceId}_${orgId}_${widgetId}`;
    return Md5.init(widgetCacheId);
};

const App = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<any>();
    const omnichannelConfig = getOmnichannelChatConfig();
    const widgetCacheId = getWidgetCacheId(omnichannelConfig.widgetId, omnichannelConfig.orgId, "");
    
    //get widget state from localStorage
    //const widgetStateFromCache = localStorage.getItem(widgetCacheId);

    useEffect(() => {
        const init = async () => {
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
                webChatContainerProps: {
                    disableMarkdownMessageFormatting: true, //setting the default to true for a known issue with markdown
                },
                //liveChatContextFromCache : widgetStateFromCache
            };

            setLiveChatWidgetProps(liveChatWidgetProps);
        };

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