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
            getAuthToken: async () => {
                return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI2MzdmY2M5Zi00YTliLTRhYWEtODcxMy1hMmEzY2ZkYTE1MDUiLCJpYXQiOjE1ODc1OTU5MzksIm5iZiI6MTU4NzU5NTkzOSwiZXhwIjoxNjk4NjkyMzM5LCJzdWIiOiIzOTFkNGFhZS1hZTU4LTQ2MGUtOTkzMS1hZGVlM2Q3NTk4MGUiLCJvaWQiOiIzOTFkNGFhZS1hZTU4LTQ2MGUtOTkzMS1hZGVlM2Q3NTk4MGUiLCJ0aWQiOiJjZDFiN2M2Yy04ZGZkLTQyMjQtOWZhNi0yOTkxZDM1OTYzODIiLCJ1cG4iOiJjcm1hZG1pbkBzZzQzOXRlbmFudDQ1Mi5jY3NjdHAubmV0IiwiRmlyc3ROYW1lIjoiQ3JtYWRtaW4iLCJMYXN0TmFtZSI6ImFkbWluIiwibHdpY29udGV4dHMiOnsiQ2FzZU51bWJlciI6eyJ2YWx1ZSI6IjIwMDQxNTAwMTAwMDEyNDUiLCJpc0Rpc3BsYXlhYmxlIjp0cnVlfSwiQ2FzZVRpdGxlIjp7InZhbHVlIjoiVEVzdCIsImlzRGlzcGxheWFibGUiOnRydWV9LCJBY3RpdmVTeXN0ZW0iOnsidmFsdWUiOiJEeW5hbWljcyIsImlzRGlzcGxheWFibGUiOnRydWV9LCJGaXJzdE5hbWUiOnsidmFsdWUiOiJDcm1hZG1pbiIsImlzRGlzcGxheWFibGUiOnRydWV9LCJMYXN0TmFtZSI6eyJ2YWx1ZSI6ImFkbWluIiwiaXNEaXNwbGF5YWJsZSI6dHJ1ZX0sIkN1cnJlbnRVc2VyRW1haWwiOnsidmFsdWUiOiJjcm1hZG1pbkBzZzQzOXRlbmFudDQ1Mi5jY3NjdHAubmV0IiwiaXNEaXNwbGF5YWJsZSI6dHJ1ZX0sIkNhc2VPd25lckVtYWlsIjp7InZhbHVlIjoiYUBiLmMiLCJpc0Rpc3BsYXlhYmxlIjpmYWxzZX0sIlByb2R1Y3ROYW1lIjp7InZhbHVlIjoiUG93ZXIgQXV0b21hdGUiLCJpc0Rpc3BsYXlhYmxlIjp0cnVlfSwiQ2F0ZWdvcnkiOnsidmFsdWUiOiJBcHByb3ZhbHMiLCJpc0Rpc3BsYXlhYmxlIjp0cnVlfSwiU3ViQ2F0ZWdvcnkiOnsidmFsdWUiOiJXb3JraW5nIHdpdGggYXBwcm92YWwgZmxvd3MiLCJpc0Rpc3BsYXlhYmxlIjp0cnVlfSwiU2V2ZXJpdHkiOnsidmFsdWUiOiJTZXZlcml0eUMiLCJpc0Rpc3BsYXlhYmxlIjp0cnVlfSwiU2VydmljZUxldmVsIjp7InZhbHVlIjoiUHJvZmVzc2lvbmFsIiwiaXNEaXNwbGF5YWJsZSI6dHJ1ZX0sIkxhbmd1YWdlIjp7InZhbHVlIjoiZW4tVVMiLCJpc0Rpc3BsYXlhYmxlIjp0cnVlfSwiTG9jYXRpb24iOnsidmFsdWUiOiJVUyIsImlzRGlzcGxheWFibGUiOnRydWV9fX0.ddgAh8-t7ZJiUPpPgR29x6sMBG-iN_5o0I68AYldRYhguWY9M_Uy0jYU1kHhnRpeLxZjaXpPq2C9Inl6kIbdSJEFQ06oEA9W5ML85E5NZMJkO55c9UPB5v4UmNIeMpkXAZTc7gK607bUSuSYrBVNW0hBUeW_rAGvYyK3Jm80HTeA-R1t72I_6_EjOsrY5YoXdLwMhhBArTQU_6NUrhO_RizCj9NAhuwNVulxbpbFAWmPywH4yWenBSe_eaOEK8wV62iZk1Rc3zEyJZSm_-q5GB764zLjcWqohqj6gArJeZNf1QEPH3FKRhuKwBI_EiVRGudaGldtrsOch5axTA318A";
            },
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
