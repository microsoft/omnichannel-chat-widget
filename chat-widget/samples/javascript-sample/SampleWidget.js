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
import getMockChatSDKIfApplicable from "./getMockChatSDKIfApplicable";
import { memoryDataStore } from "./Common/MemoryDataStore";

let liveChatWidgetProps;

async function fetchAuthTokenViaNetlify() {
    const url = "https://omnichannel-auth-server.netlify.app/.netlify/functions/api/login";
    const lwiContexts = {
        Name: { value: "Contoso", isDisplayable: "true" },
        Email: { value: "foo@microsoft.com", isDisplayable: "true" },
        Secret: { value: "***" }
    };
    const data = {
        contactid: "edward",
        expiry: 10 * 60,
        lwicontexts: JSON.stringify(lwiContexts)
    };
    const payload = {
        method: "POST",
        body: JSON.stringify(data)
    };
    try {
        const response = await fetch(url, payload);
        if (response.ok) {
            const authToken = await response.text();
            return authToken;
        }
    } catch (err) {
        console.log(err);
    }
    return "";
}

async function main() {
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
    const authToken = await fetchAuthTokenViaNetlify();
    const chatSDKConfig = {
        getAuthToken: () => authToken || ""
    };
    let chatSDK = new OmnichannelChatSDK(omnichannelConfig, chatSDKConfig);
    chatSDK = getMockChatSDKIfApplicable(chatSDK, customizationJson);
    await chatSDK.initialize({ useParallelLoad: true });
    const chatConfig = await chatSDK.getLiveChatConfig();
    memoryDataStore();
    await getUnreadMessageCount();
    await registerVisibilityListener();

    function switchConfig(config) {
        liveChatWidgetProps = {
            ...config,
            chatSDK,
            chatConfig,
            telemetryConfig: {
                chatWidgetVersion,
                chatComponentVersion,
                OCChatSDKVersion: chatSdkVersion
            }
        };
        ReactDOM.render(
            <LiveChatWidget {...liveChatWidgetProps} />,
            document.getElementById("oc-lcw-container")
        );
    }

    function setCustomContext() {
        const setCustomContextEvent = {
            eventName: "SetCustomContext",
            payload: {
                contextKey1: { value: "contextValue1", isDisplayable: true },
                contextKey2: { value: 12.34, isDisplayable: false },
                contextKey3: { value: true }
            }
        };
        BroadcastService.postMessage(setCustomContextEvent);
    }

    function startChat(context) {
        const setCustomContextEvent = {
            eventName: "StartChat",
            payload: { customContext: context }
        };
        BroadcastService.postMessage(setCustomContextEvent);
    }

    function endChat() {
        const endChatEvent = { eventName: "InitiateEndChat" };
        BroadcastService.postMessage(endChatEvent);
    }

    function startProactiveChat() {
        const startProactiveChatEvent = {
            eventName: "StartProactiveChat",
            payload: {
                notificationConfig: { message: "Hi, how may I help you?" },
                enablePreChat: true,
                inNewWindow: false
            }
        };
        BroadcastService.postMessage(startProactiveChatEvent);
    }

    function sendCustomEvent(payload) {
        const customEvent = { eventName: "sendCustomEvent", payload };
        BroadcastService.postMessage(customEvent);
    }

    function setOnCustomEvent(callback) {
        BroadcastService.getMessageByEventName("onCustomEvent").subscribe(event => {
            if (event && typeof callback === "function") {
                callback(event);
            }
        });
    }

    window.switchConfig = switchConfig;
    window.startProactiveChat = startProactiveChat;
    window.startChat = startChat;
    window.endChat = endChat;
    window.setCustomContext = setCustomContext;
    window.sendCustomEvent = sendCustomEvent;
    window.setOnCustomEvent = setOnCustomEvent;

    switchConfig(customizationJson);
}

main();