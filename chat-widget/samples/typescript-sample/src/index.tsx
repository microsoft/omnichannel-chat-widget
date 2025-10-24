import * as OcChatComponentPackageInfo from "@microsoft/omnichannel-chat-components/package.json";
import * as OcChatSdkPackageinfo from "@microsoft/omnichannel-chat-sdk/package.json";
import * as OcChatWidgetPackageInfo from "@microsoft/omnichannel-chat-widget/package.json";

import React, { useEffect, useState } from "react";

import { CoffeeChatIconBase64 } from "../src/common/assets";
import { LiveChatWidget, BroadcastService } from "@microsoft/omnichannel-chat-widget";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom/client";
import { defaultProps } from "../src/common/defaultProps";

const getOmnichannelChatConfig = () => {
    // persistant chat with link survey
    const omnichannelConfig = {
        orgId: "b3405482-62a4-f011-bbc7-000d3a32c974",
        orgUrl: "https://m-b3405482-62a4-f011-bbc7-000d3a32c974.preprod.omnichannelengagementhub.com",
        widgetId: "edd4746e-a9be-4df2-8dd0-ea1edf5607af"
    };
    return omnichannelConfig;
};

function endChat() {
    // Use imported BroadcastService directly
    const endChatEvent = {
        eventName: "InitiateEndChat"
    };
    setTimeout(() => {
        BroadcastService.postMessage(endChatEvent);
        console.log("InitiateEndChat event sent to widget");
    }, 10*1000);
}

const App = () => {
    // To avoid webpack 5 warning and soon obsolete code, rename the packageinfo variable
    const OcSdkPkginfo = OcChatSdkPackageinfo;
    const OcChatWidgetPkgInfo = OcChatWidgetPackageInfo;
    const OcChatComponentPkgInfo = OcChatComponentPackageInfo;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [liveChatWidgetProps, setLiveChatWidgetProps] = useState<any>();
    const omnichannelConfig = getOmnichannelChatConfig();
    const jwt_2025 = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYWFhYWFhYS0wMDAwLTExMTEtMjIyMi1iYmJiYmJiYmJiYmIiLCJsd2ljb250ZXh0cyI6IntcIm1zZHluX2NhcnR2YWx1ZVwiOlwiMTAwMDBcIiwgXCJtc2R5bl9pc3ZpcFwiOlwiZmFsc2VcIiwgXCJwb3J0YWxjb250YWN0aWRcIjpcImFhYWFhYWFhLTAwMDAtMTExMS0yMjIyLWJiYmJiYmJiYmJiYlwifSIsImlhdCI6MTU0MjYyMjA3MSwiaXNzIjoiY29udG9zb2hlbHAuY29tIiwiZXhwIjoxODQyNjI1NjcyLCJuYmYiOjE1NDI2MjIwNzJ9.MKKITr-1H24MKkbhPY0cBmFD-K6_M1kVHpsAPEv9oibBrby8vktrpnkl4PXpF1UaE9h1jFxzgQwAYReZpf9pZt_2ht5Gu_zLoBCTSqh73xudYJKkoaLJx3dNHkTsKglaB3zGItKsOWjY2Cs4v5e0OwHM0VFAZ0v6ahiFgZODLll7ChloQ7Yet74rr9evQBsbNVWDgFFZ-E3XbfV73yc9yviE7eC2B8Gph09apTAkxbYqNThMoUeQTQHR9p8AAHADIU2VzLIsaCTzYVTpZ4chpeEcem3QxQlEmjWiNDxxkix0N-b9gz4a0CPqMSwLHKndk15Q79nzmDGwRw2mzbFG2w";
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
                        height: "600px",
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
                },
                getAuthToken: (callback: any) => {
                    console.log("getOmnichannel auth token been invoked", callback);
                    return jwt_2025;
                }
            };

            setLiveChatWidgetProps(liveChatWidgetProps);
        };

        init();
    }, []);

    return (
        <div>
            <div >
                <label>{"@microsoft/omnichannel-chat-widget: 1.8.3"}</label>
                <button onClick={endChat}>
                End Chat after 10s (BroadcastService)
                </button>
            </div>
            {liveChatWidgetProps && <LiveChatWidget {...liveChatWidgetProps} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <App />
);
