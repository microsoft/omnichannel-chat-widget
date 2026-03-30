/* eslint @typescript-eslint/no-explicit-any: "off" */

import * as React from "react";
import ReactDOM from "react-dom/client";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import LiveChatWidget from "../../lib/esm/components/livechatwidget/LiveChatWidget.js";
import { DesignerChatSDK } from "../../lib/esm/components/webchatcontainerstateful/common/DesignerChatSDK.js";
import { DemoChatSDK } from "../../lib/esm/components/webchatcontainerstateful/common/DemoChatSDK.js";
import { MockChatSDK } from "../../lib/esm/components/webchatcontainerstateful/common/mockchatsdk.js";
import { version as chatComponentVersion } from "@microsoft/omnichannel-chat-components/package.json";
import { version as chatSdkVersion } from "@microsoft/omnichannel-chat-sdk/package.json";
import { version as chatWidgetVersion } from "../../package.json";

const SCRIPT_ID = "oc-lcw-script";
const CONTAINER_ID = "oc-lcw-container";
const WIDGET_STATE_KEY = "LcwChatWidgetState";
const WIDGET_STATE_CHANGED_EVENT = "ChatWidgetStateChanged";

// ---------------------------------------------------------------------------
// Config resolution — script tag attributes take precedence over URL params
// ---------------------------------------------------------------------------

const getOmnichannelConfig = () => {
    const script = document.getElementById(SCRIPT_ID);
    const params = new URLSearchParams(window.location.search);

    return {
        orgId:    params.get("data-org-id")  ?? script?.getAttribute("data-org-id")  ?? "",
        orgUrl:   params.get("data-org-url") ?? script?.getAttribute("data-org-url") ?? "",
        widgetId: params.get("data-app-id")  ?? script?.getAttribute("data-app-id")  ?? ""
    };
};

// ---------------------------------------------------------------------------
// Customization callback — invoked from data-customization-callback attribute
// ---------------------------------------------------------------------------

const getCustomizationJson = async () => {
    const script = document.getElementById(SCRIPT_ID);
    const callbackName = script?.getAttribute("data-customization-callback");
    const callback = window[callbackName];

    if (callback && typeof callback === "function") {
        try {
            return await callback();
        } catch (e) {
            console.warn("[LiveChatBootstrapper] Customization callback failed:", e);
            return {};
        }
    }
    return {};
};

// ---------------------------------------------------------------------------
// Mock SDK — activated via customizationJson.mock.type
// ---------------------------------------------------------------------------

const resolveChatSDK = (chatSDK, customizationJson) => {
    const mockType = customizationJson?.mock?.type?.toLowerCase();
    if (!mockType) return chatSDK;

    switch (mockType) {
        case "demo":     return new DemoChatSDK();
        case "designer": return new DesignerChatSDK();
        default:         return new MockChatSDK();
    }
};

// ---------------------------------------------------------------------------
// Unread message count in browser tab title
// ---------------------------------------------------------------------------

const registerUnreadMessageCount = () => {
    const originalTitle = window.document.title;
    BroadcastService.getMessageByEventName("UnreadMessageCount").subscribe((event) => {
        window.document.title = event.payload > 0
            ? `(${event.payload}) ${originalTitle}`
            : originalTitle;
    });
};

// ---------------------------------------------------------------------------
// Page visibility → notify widget when tab is hidden / visible
// ---------------------------------------------------------------------------

const registerVisibilityListener = () => {
    window.addEventListener("visibilitychange", () => {
        BroadcastService.postMessage({
            eventName: "hideChatVisibilityChangeEvent",
            payload: { isChatHidden: document.hidden }
        });
    });
};

// ---------------------------------------------------------------------------
// Widget state caching (localStorage)
// ---------------------------------------------------------------------------

const registerWidgetStateCache = () => {
    BroadcastService.getMessageByEventName(WIDGET_STATE_CHANGED_EVENT).subscribe((msg) => {
        try {
            localStorage.setItem(WIDGET_STATE_KEY, JSON.stringify(msg.payload));
        } catch (e) {
            console.warn("[LiveChatBootstrapper] Unable to persist widget state:", e);
        }
    });
};

const getWidgetStateFromCache = () => {
    try {
        const raw = localStorage.getItem(WIDGET_STATE_KEY);
        return raw ? JSON.parse(raw) : undefined;
    } catch {
        return undefined;
    }
};

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

let root = null;

const renderWidget = (chatSDK, chatConfig, customProps) => {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) {
        console.error(`[LiveChatBootstrapper] Mount point #${CONTAINER_ID} not found in DOM.`);
        return;
    }

    const props = {
        ...customProps,
        chatSDK,
        chatConfig,
        liveChatContextFromCache: getWidgetStateFromCache(),
        telemetryConfig: {
            chatWidgetVersion,
            chatComponentVersion,
            OCChatSDKVersion: chatSdkVersion
        }
    };

    if (!root) {
        root = ReactDOM.createRoot(container);
    }
    root.render(React.createElement(LiveChatWidget, props));
};

// ---------------------------------------------------------------------------
// Window API — callable from the host page
// ---------------------------------------------------------------------------

const exposeWindowAPI = (chatSDK, chatConfig, customizationJson) => {
    // Re-render with a different config at runtime
    window.switchConfig = (config) => {
        renderWidget(chatSDK, chatConfig, { ...customizationJson, ...config });
    };

    // Programmatically start a chat session (with optional custom context)
    window.startChat = (customContext) => {
        BroadcastService.postMessage({
            eventName: "StartChat",
            payload: { customContext }
        });
    };

    // Programmatically end the active chat session
    window.endChat = () => {
        BroadcastService.postMessage({ eventName: "InitiateEndChat" });
    };

    // Trigger a proactive chat notification bubble
    window.startProactiveChat = (message, enablePreChat = true, inNewWindow = false) => {
        BroadcastService.postMessage({
            eventName: "StartProactiveChat",
            payload: {
                notificationConfig: { message: message ?? "Hi, how may I help you?" },
                enablePreChat,
                inNewWindow
            }
        });
    };

    // Push custom context variables into the active conversation
    window.setCustomContext = (context) => {
        BroadcastService.postMessage({
            eventName: "SetCustomContext",
            payload: context
        });
    };

    // Send a custom event payload to the widget
    window.sendCustomEvent = (payload) => {
        BroadcastService.postMessage({ eventName: "sendCustomEvent", payload });
    };

    // Subscribe to custom events emitted by the widget
    window.setOnCustomEvent = (callback) => {
        BroadcastService.getMessageByEventName("onCustomEvent").subscribe((event) => {
            if (event && typeof callback === "function") {
                callback(event);
            }
        });
    };
};

// ---------------------------------------------------------------------------
// Bootstrap entry point
// ---------------------------------------------------------------------------

const bootstrap = async () => {
    try {
        const omnichannelConfig  = getOmnichannelConfig();
        const customizationJson  = await getCustomizationJson();

        let chatSDK = new OmnichannelChatSDK(omnichannelConfig);
        chatSDK = resolveChatSDK(chatSDK, customizationJson);

        await chatSDK.initialize({ useParallelLoad: true });
        const chatConfig = await chatSDK.getLiveChatConfig();

        registerUnreadMessageCount();
        registerVisibilityListener();
        registerWidgetStateCache();

        exposeWindowAPI(chatSDK, chatConfig, customizationJson);
        renderWidget(chatSDK, chatConfig, customizationJson);
    } catch (e) {
        console.error("[LiveChatBootstrapper] Initialization failed:", e);
    }
};

bootstrap();
