import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { LiveChatWidget } from "@microsoft/omnichannel-chat-widget";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as OcChatSdkPackageinfo from "@microsoft/omnichannel-chat-sdk/package.json";
import * as OcChatWidgetPackageInfo from "@microsoft/omnichannel-chat-widget/package.json";
import * as OcChatComponentPackageInfo from "@microsoft/omnichannel-chat-components/package.json";
import { defaultProps } from "../src/common/defaultProps";
import { CoffeeChatIconBase64 } from "../src/common/assets";

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
    // To avoid webpack 5 warning and soon obsolete code, rename the packageinfo variable
    const OcSdkPkginfo = OcChatSdkPackageinfo;
    const OcChatWidgetPkgInfo = OcChatWidgetPackageInfo;
    const OcChatComponentPkgInfo = OcChatComponentPackageInfo;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<any>();
    const omnichannelConfig = getOmnichannelChatConfig();

    useEffect(() => {
        const init = async () => {
            const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
            await chatSDK.initialize();
            const chatConfig = await chatSDK.getLiveChatConfig();

            const liveChatWidgetProps = {
                ...defaultProps,
                chatButtonProps: { // example: chat button customization overrides
                    controlProps: {
                        titleText: "",
                        subtitleText: "",
                        hideChatTextContainer: true,
                    },
                    styleProps: {
                        generalStyleProps: {
                            height: "56px",
                            width: "56px",
                            borderRadius: "50%",
                        },
                        iconStyleProps: {
                            backgroundColor: "#c5ecc5",
                            backgroundImage: `url(${CoffeeChatIconBase64})`,
                        }
                    },
                },
                headerProps: { // example: default header is being overriden with a new background color style
                    styleProps: {
                        generalStyleProps: {
                            background: "#c5ecc5"
                        }
                    }
                },
                loadingPaneProps: { // example: loading pane customization overrides
                    styleProps: {
                        generalStyleProps: {
                            backgroundColor: "#c5ecc5"
                        }
                    },
                    titleStyleProps: {
                        fontFamily: "Garamond"
                    },
                    subtitleStyleProps: {
                        fontFamily: "Garamond"
                    },
                    spinnerTextStyleProps: {
                        fontFamily: "Garamond"
                    }
                },
                webChatContainerProps: { // example: web chat customization overrides
                    webChatStyles: {
                        bubbleBackground: "white",
                        bubbleFromUserBackground: "#c5ecc5",
                        bubbleFromUserTextColor: "#051005",
                        bubbleTextColor: "#051005",
                        primaryFont: "Garamond"
                    },
                    disableMarkdownMessageFormatting: true, // setting the default to true for a known issue with markdown
                },
                styleProps: { // example: adjusting sizing and placement of the chat widget
                    generalStyles: {
                        width: "50%",
                        height: "800px",
                        bottom: "30px",
                        right: "30px"
                    }
                },
                chatSDK, // mandatory
                chatConfig, // mandatory
                telemetryConfig: { // mandatory for telemetry
                    chatWidgetVersion: OcChatWidgetPkgInfo.version,
                    chatComponentVersion: OcChatComponentPkgInfo.version,
                    OCChatSDKVersion: OcSdkPkginfo.version
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