import * as React from "react";

import { BroadcastService } from "../lib/esm/index.js";
import LiveChatWidget from "../lib/esm/components/livechatwidget/LiveChatWidget.js";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import ReactDOM from "react-dom";
import { getCustomizationJson } from "./getCustomizationJson";
import { registerCacheWidgetStateEvent, restoreWidgetStateIfExistInCache } from "./cacheWidgetState.js";
import { getUnreadMessageCount } from "./getUnreadMessageCount";
import { clientDataStoreProvider } from "./Common/clientDataStoreProvider";
import { memoryDataStore } from "./Common/MemoryDataStore";
/* eslint @typescript-eslint/no-explicit-any: "off" */

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
    await registerCacheWidgetStateEvent();
    memoryDataStore();
    const widgetStateFromCache = await restoreWidgetStateIfExistInCache();
    const widgetStateJson = widgetStateFromCache ? JSON.parse(widgetStateFromCache) : undefined;
    await getUnreadMessageCount();
    const switchConfig = (config) => {
        liveChatWidgetProps = config;
        liveChatWidgetProps = {
            ...liveChatWidgetProps,
            chatSDK: chatSDK,
            chatConfig: chatConfig,
            liveChatContextFromCache: widgetStateJson,
            contextDataStore: clientDataStoreProvider()
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
