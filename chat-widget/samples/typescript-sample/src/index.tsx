import * as OcChatComponentPackageInfo from "@microsoft/omnichannel-chat-components/package.json";
import * as OcChatSdkPackageinfo from "@microsoft/omnichannel-chat-sdk/package.json";
import * as OcChatWidgetPackageInfo from "@microsoft/omnichannel-chat-widget/package.json";

import React, { useEffect, useState } from "react";

import { CoffeeChatIconBase64 } from "../src/common/assets";
import { LiveChatWidget } from "@microsoft/omnichannel-chat-widget";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom/client";
import { defaultProps } from "../src/common/defaultProps";

const getOmnichannelChatConfig = () => {
    const params = new URLSearchParams(window.location.search);
    const omnichannelConfig = {
        orgId: params.get("orgId") || "ce4db5f6-1c20-ee11-a66d-000d3a0a02f3",
        orgUrl: params.get("orgUrl") || "https://m-ce4db5f6-1c20-ee11-a66d-000d3a0a02f3.ca.omnichannelengagementhub.com",
        widgetId: params.get("widgetId") || "5f04e7b3-de8d-41f2-a7a0-4f0e3c3aa4f2",
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
            try {
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
                // headerProps: { // example: default header is being overriden with a new background color style
                //     styleProps: {
                //         generalStyleProps: {
                //             background: "#c5ecc5"
                //         }
                //     }
                // },
                // loadingPaneProps: { // example: loading pane customization overrides
                //     styleProps: {
                //         generalStyleProps: {
                //             backgroundColor: "#c5ecc5"
                //         }
                //     },
                //     titleStyleProps: {
                //         fontFamily: "Garamond"
                //     },
                //     subtitleStyleProps: {
                //         fontFamily: "Garamond"
                //     },
                //     spinnerTextStyleProps: {
                //         fontFamily: "Garamond"
                //     }
                // },
                // webChatContainerProps: { // example: web chat customization overrides
                //     webChatStyles: {
                //         bubbleBackground: "white",
                //         bubbleFromUserBackground: "#c5ecc5",
                //         bubbleFromUserTextColor: "#051005",
                //         bubbleTextColor: "#051005",
                //         primaryFont: "Garamond"
                //     },
                //     disableMarkdownMessageFormatting: true, // setting the default to true for a known issue with markdown
                // },
                styleProps: {
                    generalStyles: {
                        width: "100%",
                        height: "100%",
                        bottom: "0",
                        right: "0",
                        top: "0",
                        left: "0",
                        borderRadius: "0"
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
            } catch (e) {
                console.error("SDK init failed:", e);
                document.body.innerHTML = `<pre style="color:red;padding:20px">SDK Error: ${e}</pre>`;
            }
        };

        init();
    }, []);

    return (
        <div>
            {liveChatWidgetProps && <LiveChatWidget {...liveChatWidgetProps} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <App />
);