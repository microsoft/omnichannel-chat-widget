/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { initStartChat, prepareStartChat } from "./startChat";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { cleanup } from "@testing-library/react";
import { createAdapter } from "./createAdapter";

jest.mock("../../../plugins/newMessageEventHandler", () => ({
    createOnNewAdapterActivityHandler: jest.fn(() => jest.fn())
}));

jest.mock("./createAdapter", () => ({
    createAdapter: jest.fn()
}));

jest.mock("../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn(),
        logActionEventToAllTelemetry: jest.fn(),
        logLoadingEvent: jest.fn(),
        logLoadingEventToAllTelemetry: jest.fn(),
        logSDKEvent: jest.fn(),
        logSDKEventToAllTelemetry: jest.fn()
    }
}));

jest.mock("./ActivityStreamHandler", () => ({
    ActivityStreamHandler: {
        cork: jest.fn(),
        uncork: jest.fn()
    }
}));

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

jest.mock("./setPostChatContextAndLoadSurvey", () => ({
    setPostChatContextAndLoadSurvey: jest.fn()
}));

jest.mock("./updateSessionDataForTelemetry", () => ({
    updateTelemetryData: jest.fn()
}));

// `common/utils` is fully mocked (rather than partially, via requireActual) so this suite does
// not transitively load @microsoft/omnichannel-chat-sdk.
jest.mock("../../../common/utils", () => ({
    createTimer: jest.fn(() => ({ milliSecondsElapsed: 0 })),
    getWidgetCacheIdfromProps: jest.fn(() => "test-widget-id"),
    getStateFromCache: jest.fn(() => null),
    getConversationDetailsCall: jest.fn(async () => ({})),
    checkContactIdError: jest.fn(),
    isNullOrEmptyString: jest.fn((value: any) => value === null || value === undefined || value === ""),
    isNullOrUndefined: jest.fn((value: any) => value === null || value === undefined),
    isUndefinedOrEmpty: jest.fn((value: any) => value === undefined || value === null || Object.keys(value).length === 0)
}));

jest.mock("../../../firstresponselatency/FirstMessageTrackerFromBot", () => ({
    createTrackingForFirstMessage: jest.fn()
}));

jest.mock("./startChatErrorHandler", () => ({
    handleStartChatError: jest.fn(),
    logWidgetLoadComplete: jest.fn(),
    logStartChatComplete: jest.fn()
}));

jest.mock("./endChat", () => ({
    chatSDKStateCleanUp: jest.fn()
}));

jest.mock("./liveChatConfigUtils", () => ({
    isPersistentChatEnabled: jest.fn(() => false)
}));

jest.mock("./authHelper", () => ({
    isMidAuthEnabled: jest.fn(() => false)
}));

jest.mock("./reconnectChatHelper", () => ({
    isReconnectEnabled: jest.fn(() => false),
    isPersistentEnabled: jest.fn(() => false),
    handleChatReconnect: jest.fn()
}));

jest.mock("./persistentChatHelper", () => ({
    shouldSetPreChatIfPersistentChat: jest.fn(async (_facadeChatSDK: any, _mode: any, showPrechat: boolean) => showPrechat)
}));

jest.mock("../../../common/telemetry/TelemetryManager", () => ({
    TelemetryManager: { InternalTelemetryData: { lcwRuntimeId: "test-runtime-id" } },
    TelemetryTimers: { WidgetLoadTimer: undefined }
}));

const mockCreateAdapter = createAdapter as jest.MockedFunction<typeof createAdapter>;
const mockTelemetryHelper = TelemetryHelper as jest.Mocked<typeof TelemetryHelper>;

// Creates a promise whose resolution is controlled by the test, so two invocations can be
// kept in flight at the same time.
const createDeferred = () => {
    let resolve: () => void = () => undefined;
    let reject: (reason?: unknown) => void = () => undefined;
    const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

describe("startChat - concurrent start chat protection", () => {
    let mockFacadeChatSDK: jest.Mocked<FacadeChatSDK>;
    let mockDispatch: jest.Mock;
    let mockSetAdapter: jest.Mock;
    let mockProps: any;
    let closedState: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockFacadeChatSDK = {
            startChat: jest.fn().mockResolvedValue(undefined),
            getChatToken: jest.fn().mockResolvedValue({ chatId: "chat-id", visitorId: "visitor-id" }),
            getCurrentLiveChatContext: jest.fn().mockResolvedValue({}),
            getChatSDK: jest.fn().mockReturnValue({ requestId: "test-request-id" }),
            getPreChatSurvey: jest.fn().mockResolvedValue("")
        } as any;

        mockDispatch = jest.fn();
        mockSetAdapter = jest.fn();

        mockCreateAdapter.mockResolvedValue({ activity$: { subscribe: jest.fn() } } as any);

        mockTelemetryHelper.logActionEvent = jest.fn();
        mockTelemetryHelper.logLoadingEvent = jest.fn();
        mockTelemetryHelper.logLoadingEventToAllTelemetry = jest.fn();
        mockTelemetryHelper.logSDKEvent = jest.fn();

        mockProps = {
            allowSdkChatSupport: false,
            controlProps: {},
            chatConfig: {}
        };

        closedState = {
            appStates: {
                conversationState: ConversationState.Closed,
                isMinimized: false,
                proactiveChatStates: { proactiveChatEnablePrechat: false }
            },
            domainStates: {
                liveChatConfig: { LiveWSAndLiveChatEngJoin: { msdyn_conversationmode: "Standard" } }
            }
        };
    });

    afterEach(() => {
        cleanup();
    });

    it("should only start one chat when prepareStartChat is called twice concurrently", async () => {
        const deferred = createDeferred();
        mockFacadeChatSDK.startChat.mockReturnValue(deferred.promise);

        const first = prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);
        const second = prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);

        deferred.resolve();
        await Promise.all([first, second]);

        expect(mockFacadeChatSDK.startChat).toHaveBeenCalledTimes(1);
        expect(mockTelemetryHelper.logActionEvent).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ Event: TelemetryEvent.ConcurrentStartChatRejected })
        );
    });

    it("should only start one chat when initStartChat is called twice concurrently", async () => {
        const deferred = createDeferred();
        mockFacadeChatSDK.startChat.mockReturnValue(deferred.promise);

        const loadingState = { ...closedState, appStates: { ...closedState.appStates, conversationState: ConversationState.Loading } };

        const first = initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, loadingState, mockProps);
        const second = initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, loadingState, mockProps);

        deferred.resolve();
        await Promise.all([first, second]);

        expect(mockFacadeChatSDK.startChat).toHaveBeenCalledTimes(1);
    });

    it("should release the guard so a subsequent start chat is allowed", async () => {
        await prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);
        await prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);

        expect(mockFacadeChatSDK.startChat).toHaveBeenCalledTimes(2);
        expect(mockTelemetryHelper.logActionEvent).not.toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ Event: TelemetryEvent.ConcurrentStartChatRejected })
        );
    });

    it("should not surface the in-flight failure to the dropped concurrent caller and should release the guard", async () => {
        const deferred = createDeferred();
        mockFacadeChatSDK.getPreChatSurvey.mockReturnValue(deferred.promise as any);

        const first = prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);
        const second = prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);

        // The dropped caller resolves immediately and never observes the in-flight failure.
        await expect(second).resolves.toBeUndefined();

        deferred.reject(new Error("prechat survey failed"));
        await expect(first).rejects.toThrow("prechat survey failed");

        // Guard must be released even when the in-flight operation failed.
        mockFacadeChatSDK.getPreChatSurvey.mockResolvedValue("");
        await prepareStartChat(mockProps, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);
        expect(mockFacadeChatSDK.startChat).toHaveBeenCalledTimes(1);
    });
});
