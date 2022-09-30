import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { LiveChatWidget } from "@microsoft/omnichannel-chat-widget";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

const getOmnichannelChatConfig = () => {
    // add your own OC setting, hard-coded just for sample, should be replaced with a better handling
    const omnichannelConfig = {
        orgId: "<DATA-ORG-ID>",
        orgUrl: "<DATA-ORG-URL>",
        widgetId: "<DATA-APP-ID>"
    };
    return omnichannelConfig;
};

const App = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<any>();
    const omnichannelConfig = getOmnichannelChatConfig();
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
                }
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