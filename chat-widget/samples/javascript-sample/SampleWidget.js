import * as React from "react";

import { BroadcastService } from "../../lib/esm/index.js";
import LiveChatWidget from "../../lib/esm/components/livechatwidget/LiveChatWidget.js";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom";
import { getCustomizationJson } from "./getCustomizationJson";
import { getUnreadMessageCount, registerVisibilityListener } from "./getUnreadMessageCount";
import { memoryDataStore } from "./Common/MemoryDataStore";
/* eslint @typescript-eslint/no-explicit-any: "off" */

// Below version numbers will help us to troubleshoot issues with specific package
import { version as chatSdkVersion } from "@microsoft/omnichannel-chat-sdk/package.json";
import { version as chatWidgetVersion } from "../../package.json";
import { version as chatComponentVersion } from "@microsoft/omnichannel-chat-components/package.json";

let liveChatWidgetProps;

const main = async () => {

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const orgId = urlParams.get("data-org-id");
    const orgUrl = urlParams.get("data-org-url");
    const appId = urlParams.get("data-app-id");

    const script = document.getElementById("oc-lcw-script");
    const omnichannelConfig = {
        orgId: orgId ?? script?.getAttribute("data-org-id"),
        orgUrl: orgUrl ?? script?.getAttribute("data-org-url"),
        widgetId: appId ?? script?.getAttribute("data-app-id")
    };
    const chatSDK = new OmnichannelChatSDK(omnichannelConfig);
    await chatSDK.initialize();
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
    const startProactiveChat = (notificationUIConfig, showPrechat, inNewWindow) => {
        const startProactiveChatEvent = {
            eventName: "StartProactiveChat",
            payload: {
                bodyTitle: (notificationUIConfig && notificationUIConfig.message) ? notificationUIConfig.message : "Hello Customer",
                showPrechat: showPrechat,
                inNewWindow: inNewWindow
            }
        };
        BroadcastService.postMessage(startProactiveChatEvent);
    };

    window["switchConfig"] = switchConfig;
    window["startProactiveChat"] = startProactiveChat;
    switchConfig(await getCustomizationJson());
};

main();
