/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { initStartChat, prepareStartChat } from "./startChat";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { cleanup } from "@testing-library/react";
import { createAdapter } from "./createAdapter";
import { getStateFromCache } from "../../../common/utils";

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
    getWidgetCacheIdfromProps: jest.fn((props: any) => props?.controlProps?.widgetInstanceId ?? "test-widget-id"),
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
const mockGetStateFromCache = getStateFromCache as jest.MockedFunction<typeof getStateFromCache>;

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

// Each widget instance owns its own FacadeChatSDK (created once per widget in LiveChatWidget),
// which is what the start chat locks are keyed by.
const createMockFacadeChatSDK = (): jest.Mocked<FacadeChatSDK> => ({
    startChat: jest.fn().mockResolvedValue(undefined),
    getChatToken: jest.fn().mockResolvedValue({ chatId: "chat-id", visitorId: "visitor-id" }),
    getCurrentLiveChatContext: jest.fn().mockResolvedValue({}),
    getChatSDK: jest.fn().mockReturnValue({ requestId: "test-request-id" }),
    getPreChatSurvey: jest.fn().mockResolvedValue("")
} as any);

const createMockProps = (widgetInstanceId?: string): any => ({
    allowSdkChatSupport: false,
    controlProps: widgetInstanceId ? { widgetInstanceId } : {},
    chatConfig: {}
});

describe("startChat - concurrent start chat protection", () => {
    let mockFacadeChatSDK: jest.Mocked<FacadeChatSDK>;
    let mockDispatch: jest.Mock;
    let mockSetAdapter: jest.Mock;
    let mockProps: any;
    let closedState: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockFacadeChatSDK = createMockFacadeChatSDK();

        mockDispatch = jest.fn();
        mockSetAdapter = jest.fn();

        mockCreateAdapter.mockResolvedValue({ activity$: { subscribe: jest.fn() } } as any);
        mockGetStateFromCache.mockImplementation(() => null);

        mockTelemetryHelper.logActionEvent = jest.fn();
        mockTelemetryHelper.logLoadingEvent = jest.fn();
        mockTelemetryHelper.logLoadingEventToAllTelemetry = jest.fn();
        mockTelemetryHelper.logSDKEvent = jest.fn();

        mockProps = createMockProps();

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

    it("should report the widget cache id of the dropped caller in telemetry", async () => {
        const deferred = createDeferred();
        mockFacadeChatSDK.startChat.mockReturnValue(deferred.promise);
        const props = createMockProps("widget-instance-a");

        const first = prepareStartChat(props, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);
        const second = prepareStartChat(props, mockFacadeChatSDK, closedState, mockDispatch, mockSetAdapter);

        deferred.resolve();
        await Promise.all([first, second]);

        expect(mockTelemetryHelper.logActionEvent).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                Event: TelemetryEvent.ConcurrentStartChatRejected,
                CustomProperties: { WidgetCacheId: "widget-instance-a" }
            })
        );
    });

    describe("multiple widget instances", () => {
        it("should allow two distinct widget instances to run prepareStartChat concurrently", async () => {
            const facadeA = createMockFacadeChatSDK();
            const facadeB = createMockFacadeChatSDK();
            const propsA = createMockProps("widget-instance-a");
            const propsB = createMockProps("widget-instance-b");

            const deferredA = createDeferred();
            const deferredB = createDeferred();
            facadeA.startChat.mockReturnValue(deferredA.promise);
            facadeB.startChat.mockReturnValue(deferredB.promise);

            // Both widgets start while the other is still in flight.
            const first = prepareStartChat(propsA, facadeA, closedState, mockDispatch, mockSetAdapter);
            const second = prepareStartChat(propsB, facadeB, closedState, mockDispatch, mockSetAdapter);

            deferredA.resolve();
            deferredB.resolve();
            await Promise.all([first, second]);

            // Neither instance may be treated as a duplicate of the other.
            expect(facadeA.startChat).toHaveBeenCalledTimes(1);
            expect(facadeB.startChat).toHaveBeenCalledTimes(1);
            expect(mockTelemetryHelper.logActionEvent).not.toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ Event: TelemetryEvent.ConcurrentStartChatRejected })
            );
        });

        it("should allow two distinct widget instances to run initStartChat concurrently", async () => {
            const facadeA = createMockFacadeChatSDK();
            const facadeB = createMockFacadeChatSDK();
            const loadingState = { ...closedState, appStates: { ...closedState.appStates, conversationState: ConversationState.Loading } };

            const deferredA = createDeferred();
            const deferredB = createDeferred();
            facadeA.startChat.mockReturnValue(deferredA.promise);
            facadeB.startChat.mockReturnValue(deferredB.promise);

            const first = initStartChat(facadeA, mockDispatch, mockSetAdapter, loadingState, createMockProps("widget-instance-a"));
            const second = initStartChat(facadeB, mockDispatch, mockSetAdapter, loadingState, createMockProps("widget-instance-b"));

            deferredA.resolve();
            deferredB.resolve();
            await Promise.all([first, second]);

            expect(facadeA.startChat).toHaveBeenCalledTimes(1);
            expect(facadeB.startChat).toHaveBeenCalledTimes(1);
            expect(mockTelemetryHelper.logActionEvent).not.toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ Event: TelemetryEvent.ConcurrentStartChatRejected })
            );
        });

        it("should still drop a duplicate call for one widget instance while a different instance is in flight", async () => {
            const facadeA = createMockFacadeChatSDK();
            const facadeB = createMockFacadeChatSDK();
            const propsA = createMockProps("widget-instance-a");
            const propsB = createMockProps("widget-instance-b");

            const deferredA = createDeferred();
            const deferredB = createDeferred();
            facadeA.startChat.mockReturnValue(deferredA.promise);
            facadeB.startChat.mockReturnValue(deferredB.promise);

            const firstA = prepareStartChat(propsA, facadeA, closedState, mockDispatch, mockSetAdapter);
            const duplicateA = prepareStartChat(propsA, facadeA, closedState, mockDispatch, mockSetAdapter);
            const firstB = prepareStartChat(propsB, facadeB, closedState, mockDispatch, mockSetAdapter);

            deferredA.resolve();
            deferredB.resolve();
            await Promise.all([firstA, duplicateA, firstB]);

            expect(facadeA.startChat).toHaveBeenCalledTimes(1);
            expect(facadeB.startChat).toHaveBeenCalledTimes(1);

            const rejections = mockTelemetryHelper.logActionEvent.mock.calls
                .filter(([, payload]: any) => payload?.Event === TelemetryEvent.ConcurrentStartChatRejected);
            expect(rejections).toHaveLength(1);
            expect(rejections[0][1]).toEqual(
                expect.objectContaining({ CustomProperties: { WidgetCacheId: "widget-instance-a" } })
            );
        });

        it("should release each widget instance guard independently", async () => {
            const facadeA = createMockFacadeChatSDK();
            const facadeB = createMockFacadeChatSDK();

            await prepareStartChat(createMockProps("widget-instance-a"), facadeA, closedState, mockDispatch, mockSetAdapter);
            await prepareStartChat(createMockProps("widget-instance-b"), facadeB, closedState, mockDispatch, mockSetAdapter);
            await prepareStartChat(createMockProps("widget-instance-a"), facadeA, closedState, mockDispatch, mockSetAdapter);

            expect(facadeA.startChat).toHaveBeenCalledTimes(2);
            expect(facadeB.startChat).toHaveBeenCalledTimes(1);
            expect(mockTelemetryHelper.logActionEvent).not.toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({ Event: TelemetryEvent.ConcurrentStartChatRejected })
            );
        });
    });

    // Now that per-instance guards let two widgets run at the same time, any start-chat state kept
    // at module scope would be overwritten by whichever widget ran last. These tests pin the
    // custom context to the widget that owns it.
    describe("custom context isolation across concurrent widget instances", () => {
        it("should start each widget with the custom context from its own state", async () => {
            const facadeA = createMockFacadeChatSDK();
            const facadeB = createMockFacadeChatSDK();

            const stateWithCustomContext = (value: string) => ({
                ...closedState,
                appStates: { ...closedState.appStates, conversationState: ConversationState.Loading },
                domainStates: { ...closedState.domainStates, customContext: { widget: { value } } }
            });

            const deferredA = createDeferred();
            const deferredB = createDeferred();
            facadeA.startChat.mockReturnValue(deferredA.promise);
            facadeB.startChat.mockReturnValue(deferredB.promise);

            const first = initStartChat(facadeA, mockDispatch, mockSetAdapter, stateWithCustomContext("A"), createMockProps("widget-instance-a"));
            const second = initStartChat(facadeB, mockDispatch, mockSetAdapter, stateWithCustomContext("B"), createMockProps("widget-instance-b"));

            deferredA.resolve();
            deferredB.resolve();
            await Promise.all([first, second]);

            expect(facadeA.startChat).toHaveBeenCalledWith(
                expect.objectContaining({ customContext: { widget: { value: "A" } } })
            );
            expect(facadeB.startChat).toHaveBeenCalledWith(
                expect.objectContaining({ customContext: { widget: { value: "B" } } })
            );
        });

        it("should start each widget with the persisted custom context for its own widget cache id", async () => {
            const facadeA = createMockFacadeChatSDK();
            const facadeB = createMockFacadeChatSDK();

            mockGetStateFromCache.mockImplementation((widgetCacheId: string) => ({
                domainStates: { customContext: { cached: { value: widgetCacheId } } }
            }));

            const loadingState = { ...closedState, appStates: { ...closedState.appStates, conversationState: ConversationState.Loading } };

            const deferredA = createDeferred();
            const deferredB = createDeferred();
            facadeA.startChat.mockReturnValue(deferredA.promise);
            facadeB.startChat.mockReturnValue(deferredB.promise);

            const first = initStartChat(facadeA, mockDispatch, mockSetAdapter, loadingState, createMockProps("widget-instance-a"));
            const second = initStartChat(facadeB, mockDispatch, mockSetAdapter, loadingState, createMockProps("widget-instance-b"));

            deferredA.resolve();
            deferredB.resolve();
            await Promise.all([first, second]);

            expect(facadeA.startChat).toHaveBeenCalledWith(
                expect.objectContaining({ customContext: { cached: { value: "widget-instance-a" } } })
            );
            expect(facadeB.startChat).toHaveBeenCalledWith(
                expect.objectContaining({ customContext: { cached: { value: "widget-instance-b" } } })
            );
        });
    });
});
