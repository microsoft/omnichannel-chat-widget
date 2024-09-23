/* eslint @typescript-eslint/no-explicit-any: "off" */

import * as React from "react";

import { getUnreadMessageCount, registerVisibilityListener } from "./getUnreadMessageCount";

import { BroadcastService } from "../../lib/esm/index.js";
import LiveChatWidget from "../../lib/esm/components/livechatwidget/LiveChatWidget.js";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom";
import { version as chatComponentVersion } from "@microsoft/omnichannel-chat-components/package.json";
import { version as chatSdkVersion } from "@microsoft/omnichannel-chat-sdk/package.json";
import { version as chatWidgetVersion } from "../../package.json";
import { getCustomizationJson } from "./getCustomizationJson";
import { memoryDataStore } from "./Common/MemoryDataStore";
import getMockChatSDKIfApplicable from "./getMockChatSDKIfApplicable";

let liveChatWidgetProps;

const main = async () => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const orgId = urlParams.get("data-org-id");
    const orgUrl = urlParams.get("data-org-url");
    const appId = urlParams.get("data-app-id");

    const script = document.getElementById("oc-lcw-script");
    const customizationJson = await getCustomizationJson();
    const omnichannelConfig = {
        orgId: orgId ?? script?.getAttribute("data-org-id"),
        orgUrl: orgUrl ?? script?.getAttribute("data-org-url"),
        widgetId: appId ?? script?.getAttribute("data-app-id")
    };

    let chatSDK = new OmnichannelChatSDK(omnichannelConfig);
    chatSDK = getMockChatSDKIfApplicable(chatSDK, customizationJson);

    await chatSDK.initialize({useParallelLoad: true});
    const chatConfig = await chatSDK.getLiveChatConfig();
    memoryDataStore();
    await getUnreadMessageCount();
    await registerVisibilityListener();
    const switchConfig = (config) => {
        liveChatWidgetProps = config;
        liveChatWidgetProps = {
            ...liveChatWidgetProps,
            chatSDK: chatSDK,
            chatConfig: chatConfig,
            telemetryConfig: {
                chatWidgetVersion: chatWidgetVersion,
                chatComponentVersion: chatComponentVersion,
                OCChatSDKVersion: chatSdkVersion
            }
        };

        ReactDOM.render(
            <LiveChatWidget {...liveChatWidgetProps} />,
            document.getElementById("oc-lcw-container")
        );
    };

    const setCustomContext = () => {
        const setCustomContextEvent = {
            eventName: "SetCustomContext",
            payload: {
                "contextKey1": {"value": "contextValue1", "isDisplayable": true},
                "contextKey2": {"value": 12.34, "isDisplayable": false},
                "contextKey3": {"value": true}
            }
        };
        BroadcastService.postMessage(setCustomContextEvent);
    };

    const startChat = (context) => {
        const setCustomContextEvent = {
            eventName: "StartChat",
            payload: {
                customContext: context
            }
        };
        BroadcastService.postMessage(setCustomContextEvent);
    };

    const endChat = () => {
        const endChatEvent = {
            eventName: "InitiateEndChat"
        };
        BroadcastService.postMessage(endChatEvent);
    };

    const startProactiveChat = () => {
        const startProactiveChatEvent = {
            eventName: "StartProactiveChat",
            payload: {
                notificationConfig: {
                    message: "Hi, how may I help you?" // title text
                },
                enablePreChat: true, // enablePreChat
                inNewWindow: false
            }
        };
        BroadcastService.postMessage(startProactiveChatEvent);
    };

    window["switchConfig"] = switchConfig;
    window["startProactiveChat"] = startProactiveChat;
    window["startChat"] = startChat;
    window["endChat"] = endChat;
    window["setCustomContext"] = setCustomContext;
    switchConfig(customizationJson);
};

main();
