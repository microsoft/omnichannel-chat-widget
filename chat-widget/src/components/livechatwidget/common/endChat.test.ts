/* eslint-disable @typescript-eslint/no-explicit-any */

import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";

import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { chatSDKStateCleanUp } from "./endChat";

jest.mock("@microsoft/omnichannel-chat-sdk", () => ({
    uuidv4: jest.fn(() => "new-request-id")
}));

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn(),
        getMessageByEventName: jest.fn()
    }
}));

jest.mock("../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn(),
        logSDKEvent: jest.fn()
    }
}));

jest.mock("../../../common/utils", () => ({
    getConversationDetailsCall: jest.fn(),
    getWidgetEndChatEventName: jest.fn()
}));

jest.mock("./renderSurveyHelpers", () => ({
    getPostChatContext: jest.fn(),
    initiatePostChat: jest.fn()
}));

jest.mock("../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/activities/LazyLoadActivity", () => ({
    LazyLoadHandler: {}
}));

jest.mock("../../webchatcontainerstateful/webchatcontroller/middlewares/renderingmiddlewares/activityMiddleware", () => ({
    resetActivityMiddlewareCache: jest.fn()
}));

jest.mock("../../webchatcontainerstateful/webchatcontroller/notification/NotificationHandler", () => ({
    NotificationHandler: { dismissNotification: jest.fn() }
}));

jest.mock("../../webchatcontainerstateful/webchatcontroller/WebChatStoreLoader", () => ({
    WebChatStoreLoader: {}
}));

jest.mock("../../webchatcontainerstateful/common/defaultProps/defaultWebChatContainerStatefulProps", () => ({
    defaultWebChatContainerStatefulProps: {}
}));

jest.mock("../../../contexts/createReducer", () => ({
    executeReducer: jest.fn()
}));

jest.mock("./reconnectChatHelper", () => ({
    isPersistentEnabled: jest.fn(() => false)
}));

jest.mock("../../../common/telemetry/TelemetryManager", () => ({
    TelemetryManager: { InternalTelemetryData: {} }
}));

const mockLogActionEvent = TelemetryHelper.logActionEvent as jest.Mock;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const createChatSDK = (conversation: any = null): any => ({
    requestId: "old-request-id",
    chatToken: { chatId: "old-chat-id" },
    reconnectId: "old-reconnect-id",
    conversation
});

describe("chatSDKStateCleanUp", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([undefined, null])("should no-op when the chat SDK is %p", (chatSDK) => {
        expect(() => chatSDKStateCleanUp(chatSDK)).not.toThrow();
        expect(mockLogActionEvent).not.toHaveBeenCalled();
    });

    it("should reset the request id, chat token and reconnect id", () => {
        const chatSDK = createChatSDK();

        chatSDKStateCleanUp(chatSDK);

        expect(chatSDK.requestId).toBe("new-request-id");
        expect(chatSDK.chatToken).toEqual({});
        expect(chatSDK.reconnectId).toBeNull();
        expect(chatSDK.conversation).toBeNull();
    });

    it("should disconnect the previous conversation before dropping the reference", () => {
        const disconnect = jest.fn().mockResolvedValue(undefined);
        const conversation = { disconnect };
        const chatSDK = createChatSDK(conversation);

        chatSDKStateCleanUp(chatSDK);

        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(chatSDK.conversation).toBeNull();
        expect(mockLogActionEvent).not.toHaveBeenCalled();
    });

    it("should log and swallow an asynchronous disconnect failure", async () => {
        const chatSDK = createChatSDK({ disconnect: jest.fn().mockRejectedValue(new Error("disconnect failed")) });

        expect(() => chatSDKStateCleanUp(chatSDK)).not.toThrow();
        expect(chatSDK.conversation).toBeNull();

        await flushPromises();

        expect(mockLogActionEvent).toHaveBeenCalledWith(LogLevel.WARN, expect.objectContaining({
            Event: TelemetryEvent.ChatSDKStateCleanUpDisconnectFailed,
            ExceptionDetails: { exception: "disconnect failed" }
        }));
    });

    it("should log and swallow a synchronous disconnect failure and still reset state", () => {
        const chatSDK = createChatSDK({ disconnect: jest.fn(() => { throw new Error("sync disconnect failed"); }) });

        expect(() => chatSDKStateCleanUp(chatSDK)).not.toThrow();

        expect(chatSDK.conversation).toBeNull();
        expect(chatSDK.requestId).toBe("new-request-id");
        expect(mockLogActionEvent).toHaveBeenCalledWith(LogLevel.WARN, expect.objectContaining({
            Event: TelemetryEvent.ChatSDKStateCleanUpDisconnectFailed,
            ExceptionDetails: { exception: "sync disconnect failed" }
        }));
    });

    it("should support a conversation whose disconnect does not return a promise", () => {
        const disconnect = jest.fn(() => undefined);
        const chatSDK = createChatSDK({ disconnect });

        chatSDKStateCleanUp(chatSDK);

        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(chatSDK.conversation).toBeNull();
        expect(mockLogActionEvent).not.toHaveBeenCalled();
    });

    it("should clear a conversation that has no disconnect method", () => {
        const chatSDK = createChatSDK({});

        chatSDKStateCleanUp(chatSDK);

        expect(chatSDK.conversation).toBeNull();
        expect(mockLogActionEvent).not.toHaveBeenCalled();
    });
});
