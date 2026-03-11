/* eslint-disable @typescript-eslint/no-explicit-any */

import { BroadcastEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import ChatWidgetEvents from "./ChatWidgetEvents";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { IPersistentChatHistoryProps } from "../interfaces/IPersistentChatHistoryProps";
import PersistentConversationHandler from "./PersistentConversationHandler";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import conversationDividerActivity from "../../webchatcontainerstateful/common/activities/conversationDividerActivity";
import convertPersistentChatHistoryMessageToActivity from "../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

// Mock dependencies
jest.mock("../../../common/utils/dispatchCustomEvent");
jest.mock("./ChatWidgetEvents", () => ({
    ADD_ACTIVITY: "ADD_ACTIVITY",
    FETCH_PERSISTENT_CHAT_HISTORY: "FETCH_PERSISTENT_CHAT_HISTORY",
    NO_MORE_HISTORY_AVAILABLE: "NO_MORE_HISTORY_AVAILABLE",
    HISTORY_LOAD_ERROR: "HISTORY_LOAD_ERROR",
    HISTORY_BATCH_LOADED: "HISTORY_BATCH_LOADED"
}));
jest.mock("../../../common/telemetry/TelemetryHelper");
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        getMessageByEventName: jest.fn()
    }
}));
jest.mock("../../webchatcontainerstateful/common/activities/conversationDividerActivity", () => ({
    __esModule: true,
    default: {
        id: "divider-activity",
        type: "divider",
        channelData: {
            tags: ["divider"]
        }
    }
}));
jest.mock("../../webchatcontainerstateful/common/activityConverters/convertPersistentChatHistoryMessageToActivity");
jest.mock("./defaultProps/defaultPersistentChatHistoryProps", () => ({
    defaultPersistentChatHistoryProps: {
        pageSize: 10,
        persistentChatHistoryEnabled: true
    }
}));

const mockDispatchCustomEvent = dispatchCustomEvent as jest.MockedFunction<typeof dispatchCustomEvent>;
const mockTelemetryHelper = TelemetryHelper as jest.Mocked<typeof TelemetryHelper>;
const mockBroadcastService = BroadcastService as jest.Mocked<typeof BroadcastService>;
const mockConvertMessage = convertPersistentChatHistoryMessageToActivity as jest.MockedFunction<typeof convertPersistentChatHistoryMessageToActivity>;

describe("PersistentConversationHandler", () => {
    let mockFacadeChatSDK: jest.Mocked<FacadeChatSDK>;
    let handler: PersistentConversationHandler;
    let mockSubscription: { unsubscribe: jest.Mock };
    
    const defaultProps: IPersistentChatHistoryProps = {
        pageSize: 10,
        persistentChatHistoryEnabled: true
    };

    const createMockMessage = (id: string, conversationId = "conv1") => ({
        id,
        content: `Message ${id}`,
        timestamp: new Date().toISOString(),
        from: { id: "user1", name: "User 1" },
        conversationId
    });

    const createMockActivity = (id: string, conversationId = "conv1", count = 0) => ({
        id,
        type: "message",
        timestamp: new Date().toISOString(),
        from: { id: "user1", name: "User 1" },
        text: `Activity ${id}`,
        channelData: {
            conversationId,
            "webchat:sequence-id": count
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockSubscription = { unsubscribe: jest.fn() };
        mockBroadcastService.getMessageByEventName.mockReturnValue({
            subscribe: jest.fn().mockReturnValue(mockSubscription)
        } as any);

        mockFacadeChatSDK = {
            fetchPersistentConversationHistory: jest.fn()
        } as any;

        mockTelemetryHelper.logActionEvent = jest.fn();
        mockTelemetryHelper.logSDKEvent = jest.fn();

        handler = new PersistentConversationHandler(mockFacadeChatSDK, defaultProps);
    });

    describe("Initialization", () => {
        it("should initialize with default props", () => {
            expect(handler).toBeInstanceOf(PersistentConversationHandler);
            expect(mockBroadcastService.getMessageByEventName).toHaveBeenCalledWith(
                BroadcastEvent.PersistentConversationReset
            );
        });

        it("should merge props with defaults", () => {
            const customProps = {
                pageSize: 10,
                persistentChatHistoryEnabled: false
            };

            const customHandler = new PersistentConversationHandler(mockFacadeChatSDK, customProps);
            expect(customHandler).toBeInstanceOf(PersistentConversationHandler);
        });

        it("should handle undefined pageSize in props", () => {
            const propsWithoutPageSize = {
                persistentChatHistoryEnabled: true
            } as IPersistentChatHistoryProps;

            const customHandler = new PersistentConversationHandler(mockFacadeChatSDK, propsWithoutPageSize);
            expect(customHandler).toBeInstanceOf(PersistentConversationHandler);
        });
    });

    describe("Reset Functionality", () => {
        it("should reset all state properties", () => {
            // Simulate some state changes by calling pullHistory first
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: [],
                nextPageToken: "test-token"
            });
            
            handler.pullHistory();
            
            // Call destroy instead of reset to test unsubscription
            handler.destroy();

            // Test that reset event listener was unsubscribed
            expect(mockSubscription.unsubscribe).toHaveBeenCalled();
        });

        it("should handle reset broadcast event", () => {
            const resetHandler = mockBroadcastService.getMessageByEventName.mock.calls[0][0];
            expect(resetHandler).toBe(BroadcastEvent.PersistentConversationReset);
            
            const subscribeCallback = (mockBroadcastService.getMessageByEventName as any).mock.results[0].value.subscribe.mock.calls[0][0];
            
            // Spy on reset method
            const resetSpy = jest.spyOn(handler, "reset");
            
            // Execute the callback
            subscribeCallback();
            
            expect(resetSpy).toHaveBeenCalled();
        });
    });

    describe("History Fetching", () => {
        it("should fetch history successfully", async () => {
            const mockMessages = [
                createMockMessage("msg1"),
                createMockMessage("msg2")
            ];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            const mockActivity1 = createMockActivity("activity1");
            const mockActivity2 = createMockActivity("activity2");
            
            mockConvertMessage
                .mockReturnValueOnce(mockActivity1)
                .mockReturnValueOnce(mockActivity2);

            await handler.pullHistory();

            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledWith({
                pageSize: 10,
                pageToken: undefined
            });
            
            expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(4); // 2 activities + 1 divider + 1 HISTORY_BATCH_LOADED
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({ id: "activity2" })
            });
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.HISTORY_BATCH_LOADED, {
                messageCount: 2
            });
        });

        it("should handle empty message response", async () => {
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: [],
                nextPageToken: null
            });

            await handler.pullHistory();

            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalled();
            // Should dispatch NO_MORE_HISTORY_AVAILABLE event
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
        });

        it("should handle fetch error and allow retry", async () => {
            const error = new Error("Fetch failed");
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockRejectedValue(error);

            await handler.pullHistory();

            expect(mockTelemetryHelper.logSDKEvent).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    ExceptionDetails: error
                })
            );
            
            // Should dispatch HISTORY_LOAD_ERROR instead of NO_MORE_HISTORY_AVAILABLE
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.HISTORY_LOAD_ERROR);
            
            // Should NOT dispatch NO_MORE_HISTORY_AVAILABLE on error
            expect(mockDispatchCustomEvent).not.toHaveBeenCalledWith(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
            
            // Should be able to retry after error (reset mock and try again)
            mockDispatchCustomEvent.mockClear();
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: [createMockMessage("msg1")],
                nextPageToken: null
            });
            
            mockConvertMessage.mockReturnValue(createMockActivity("activity1"));
            
            await handler.pullHistory();
            
            // Second attempt should succeed
            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(2);
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.ADD_ACTIVITY, expect.any(Object));
        });

        it("should prevent concurrent pulls", async () => {
            const mockMessages = [createMockMessage("msg1")];
            
            // First call will be pending
            let resolveFirst: (value: any) => void;
            const firstPromise = new Promise(resolve => {
                resolveFirst = resolve;
            });
            
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockReturnValueOnce(firstPromise);

            // Start first pull
            const firstPull = handler.pullHistory();
            
            // Start second pull immediately (should be ignored)
            const secondPull = handler.pullHistory();

            // Resolve first call
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolveFirst!({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            await Promise.all([firstPull, secondPull]);

            // Should only have been called once
            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(1);
        });

        it("should prevent duplicate pageToken pulls", async () => {
            const mockMessages = [createMockMessage("msg1")];
            
            // Set up initial state with a pageToken
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValueOnce({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            mockConvertMessage.mockReturnValue(createMockActivity("activity1"));

            // First pull to set pageToken
            await handler.pullHistory();

            // Reset mock to track second call
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockClear();
            
            // Mock another response for second pull
            let resolveSecond: (value: any) => void;
            const secondPromise = new Promise(resolve => {
                resolveSecond = resolve;
            });
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockReturnValueOnce(secondPromise);

            // Start second pull
            const secondPull = handler.pullHistory();
            
            // Try to start third pull with same pageToken (should be ignored)
            const thirdPull = handler.pullHistory();

            // Resolve second pull
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolveSecond!({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            await Promise.all([secondPull, thirdPull]);

            // Should only have been called once more (for the second pull)
            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(1);
        });
    });

    describe("Message Processing", () => {
        it("should process messages in reverse order", async () => {
            const mockMessages = [
                createMockMessage("msg1"),
                createMockMessage("msg2"),
                createMockMessage("msg3")
            ];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const activities = [
                createMockActivity("activity1", "conv1", 0),
                createMockActivity("activity2", "conv1", 1),
                createMockActivity("activity3", "conv1", 2)
            ];

            mockConvertMessage
                .mockReturnValueOnce(activities[2]) // msg3 -> activity3
                .mockReturnValueOnce(activities[1]) // msg2 -> activity2
                .mockReturnValueOnce(activities[0]); // msg1 -> activity1

            await handler.pullHistory();

            // Should process in reverse order (msg3, msg2, msg1)
            expect(mockConvertMessage).toHaveBeenNthCalledWith(1, mockMessages[2]);
            expect(mockConvertMessage).toHaveBeenNthCalledWith(2, mockMessages[1]);
            expect(mockConvertMessage).toHaveBeenNthCalledWith(3, mockMessages[0]);
        });

        it("should assign incremental count to activities", async () => {
            const mockMessages = [createMockMessage("msg1")];
            
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const mockActivity = createMockActivity("activity1");
            mockConvertMessage.mockReturnValue(mockActivity);

            await handler.pullHistory();

            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({
                    channelData: expect.objectContaining({
                        metadata: { count: 0 }
                    })
                })
            });
        });

        it("should handle message conversion errors", async () => {
            const mockMessages = [
                createMockMessage("msg1"),
                createMockMessage("msg2")
            ];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const error = new Error("Conversion failed");
            mockConvertMessage
                .mockImplementationOnce(() => { throw error; })
                .mockReturnValueOnce(createMockActivity("activity2"));

            await handler.pullHistory();

            expect(mockTelemetryHelper.logActionEvent).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    ExceptionDetails: error
                })
            );

            // Should still process the second message
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({ id: "activity2" })
            });
        });

        it("should handle null activity from conversion", async () => {
            const mockMessages = [createMockMessage("msg1")];
            
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            mockConvertMessage.mockReturnValue(null);

            await handler.pullHistory();

            // Should still dispatch NO_MORE_HISTORY_AVAILABLE for null pageToken
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
        });
    });

    describe("Divider Activity Creation", () => {
        it("should create divider for different conversation IDs", async () => {
            const mockMessages = [
                createMockMessage("msg1", "conv1"),
                createMockMessage("msg2", "conv2") // Different conversation
            ];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const activity1 = createMockActivity("activity1", "conv1", 1);
            const activity2 = createMockActivity("activity2", "conv2", 2);

            mockConvertMessage
                .mockReturnValueOnce(activity2) // msg2 processed first (reverse order)
                .mockReturnValueOnce(activity1);

            await handler.pullHistory();

            // Should create divider for activity1 since it has different conversationId than previous
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({
                    ...conversationDividerActivity,
                    channelData: expect.objectContaining({
                        conversationId: "conv1",
                        "webchat:sequence-id": 2 // sequenceId + 1
                    }),
                    identifier: "divider-conv1"
                })
            });
        });

        it("should not create divider for same conversation ID", async () => {
            const mockMessages = [
                createMockMessage("msg1", "conv1"),
                createMockMessage("msg2", "conv1") // Same conversation
            ];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const activity1 = createMockActivity("activity1", "conv1", 1);
            const activity2 = createMockActivity("activity2", "conv1", 2);

            mockConvertMessage
                .mockReturnValueOnce(activity2)
                .mockReturnValueOnce(activity1);

            await handler.pullHistory();

            // Should dispatch:
            // 1. NO_MORE_HISTORY_AVAILABLE (from fetchHistoryMessages when pageToken is null)
            // 2. ADD_ACTIVITY for activity2
            // 3. ADD_ACTIVITY for divider (since lastMessage is initially null)
            // 4. ADD_ACTIVITY for activity1 (no divider since same conversation)
            // 5. HISTORY_BATCH_LOADED
            expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(5);
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(1, ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(2, ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({ id: "activity2" })
            });
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(4, ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({ id: "activity1" })
            });
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(5, ChatWidgetEvents.HISTORY_BATCH_LOADED, {
                messageCount: 2
            });
        });

        it("should handle first message (no previous message)", async () => {
            const mockMessages = [createMockMessage("msg1", "conv1")];
            
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const activity1 = createMockActivity("activity1", "conv1", 1);
            mockConvertMessage.mockReturnValue(activity1);

            await handler.pullHistory();

            // Should dispatch:
            // 1. NO_MORE_HISTORY_AVAILABLE (from fetchHistoryMessages when pageToken is null)
            // 2. ADD_ACTIVITY for activity1
            // 3. ADD_ACTIVITY for divider (since lastMessage is initially null)
            // 4. HISTORY_BATCH_LOADED
            expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(4);
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(1, ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(2, ChatWidgetEvents.ADD_ACTIVITY, {
                activity: expect.objectContaining({ id: "activity1" })
            });
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(4, ChatWidgetEvents.HISTORY_BATCH_LOADED, {
                messageCount: 1
            });
        });
    });

    describe("Pagination", () => {
        it("should handle pagination with pageToken", async () => {
            // First page
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValueOnce({
                chatMessages: [createMockMessage("msg1")],
                nextPageToken: "token123"
            });

            mockConvertMessage.mockReturnValue(createMockActivity("activity1"));

            await handler.pullHistory();

            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledWith({
                pageSize: 10,
                pageToken: undefined
            });

            // Second page
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValueOnce({
                chatMessages: [createMockMessage("msg2")],
                nextPageToken: null
            });

            await handler.pullHistory();

            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledWith({
                pageSize: 10,
                pageToken: "token123"
            });
        });

        it("should stop pulling when nextPageToken is null", async () => {
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: [createMockMessage("msg1")],
                nextPageToken: null
            });

            mockConvertMessage.mockReturnValue(createMockActivity("activity1"));

            await handler.pullHistory();
            
            // Try to pull again - should return early
            await handler.pullHistory();

            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(1);
        });
    });

    describe("Error Handling", () => {
        it("should handle SDK fetch errors gracefully and allow retry", async () => {
            const error = new Error("Network error");
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockRejectedValue(error);

            await expect(handler.pullHistory()).resolves.not.toThrow();

            expect(mockTelemetryHelper.logSDKEvent).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    ExceptionDetails: error
                })
            );
            
            // Should dispatch HISTORY_LOAD_ERROR to allow recovery
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(ChatWidgetEvents.HISTORY_LOAD_ERROR);
            
            // Verify we can retry - reset and try again
            mockDispatchCustomEvent.mockClear();
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: [],
                nextPageToken: null
            });
            
            await handler.pullHistory();
            
            // Should successfully call SDK again (indicating retry capability)
            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(2);
        });

        it("should handle activity conversion errors gracefully", async () => {
            const mockMessages = [createMockMessage("msg1")];
            
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: null
            });

            const conversionError = new Error("Conversion error");
            mockConvertMessage.mockImplementation(() => {
                throw conversionError;
            });

            await expect(handler.pullHistory()).resolves.not.toThrow();

            expect(mockTelemetryHelper.logActionEvent).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    ExceptionDetails: conversionError
                })
            );
        });
    });

    describe("State Management", () => {
        it("should track isCurrentlyPulling state", async () => {
            let resolvePromise: (value: any) => void;
            const pendingPromise = new Promise(resolve => {
                resolvePromise = resolve;
            });

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockReturnValue(pendingPromise);

            // Start pull
            const pullPromise = handler.pullHistory();

            // Try to pull again while first is pending
            const secondPullPromise = handler.pullHistory();

            // Resolve first promise
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resolvePromise!({
                chatMessages: [],
                nextPageToken: null
            });

            await Promise.all([pullPromise, secondPullPromise]);

            // Should only have called fetch once
            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(1);
        });

        it("should clear pageTokenInTransitSet after completion", async () => {
            // First call to set a pageToken
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValueOnce({
                chatMessages: [createMockMessage("msg1")],
                nextPageToken: "token123"
            });

            mockConvertMessage.mockReturnValue(createMockActivity("activity1"));

            await handler.pullHistory();

            // Now the pageToken should be set, make another call
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValueOnce({
                chatMessages: [createMockMessage("msg2")],
                nextPageToken: null
            });

            await handler.pullHistory();

            // Should be able to call again with the same logic
            expect(mockFacadeChatSDK.fetchPersistentConversationHistory).toHaveBeenCalledTimes(2);
        });
    });

    describe("HISTORY_BATCH_LOADED Event", () => {
        it("should dispatch HISTORY_BATCH_LOADED after processing messages", async () => {
            const mockMessages = [createMockMessage("msg1"), createMockMessage("msg2")];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            mockConvertMessage
                .mockReturnValueOnce(createMockActivity("activity2"))
                .mockReturnValueOnce(createMockActivity("activity1"));

            await handler.pullHistory();

            // HISTORY_BATCH_LOADED should be dispatched with the message count
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
                ChatWidgetEvents.HISTORY_BATCH_LOADED,
                { messageCount: 2 }
            );
        });

        it("should dispatch HISTORY_BATCH_LOADED after ADD_ACTIVITY events", async () => {
            const mockMessages = [createMockMessage("msg1")];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            mockConvertMessage.mockReturnValue(createMockActivity("activity1"));

            await handler.pullHistory();

            // Get all dispatch calls to verify order
            const calls = mockDispatchCustomEvent.mock.calls;
            const addActivityCalls = calls.filter((c: any[]) => c[0] === ChatWidgetEvents.ADD_ACTIVITY);
            const batchLoadedCalls = calls.filter((c: any[]) => c[0] === ChatWidgetEvents.HISTORY_BATCH_LOADED);

            expect(addActivityCalls.length).toBeGreaterThan(0);
            expect(batchLoadedCalls.length).toBe(1);

            // HISTORY_BATCH_LOADED should come after all ADD_ACTIVITY calls
            const lastAddActivityIndex = calls.findIndex(
                (c: any[], i: number) => c[0] === ChatWidgetEvents.ADD_ACTIVITY &&
                    !calls.slice(i + 1).some((later: any[]) => later[0] === ChatWidgetEvents.ADD_ACTIVITY)
            );
            const batchLoadedIndex = calls.findIndex((c: any[]) => c[0] === ChatWidgetEvents.HISTORY_BATCH_LOADED);
            expect(batchLoadedIndex).toBeGreaterThan(lastAddActivityIndex);
        });

        it("should NOT dispatch HISTORY_BATCH_LOADED on empty responses", async () => {
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: [],
                nextPageToken: null
            });

            await handler.pullHistory();

            expect(mockDispatchCustomEvent).not.toHaveBeenCalledWith(
                ChatWidgetEvents.HISTORY_BATCH_LOADED,
                expect.any(Object)
            );
        });

        it("should NOT dispatch HISTORY_BATCH_LOADED on error responses", async () => {
            mockFacadeChatSDK.fetchPersistentConversationHistory.mockRejectedValue(new Error("Network error"));

            await handler.pullHistory();

            expect(mockDispatchCustomEvent).not.toHaveBeenCalledWith(
                ChatWidgetEvents.HISTORY_BATCH_LOADED,
                expect.any(Object)
            );
        });

        it("should dispatch HISTORY_BATCH_LOADED even when some messages fail conversion", async () => {
            const mockMessages = [createMockMessage("msg1"), createMockMessage("msg2")];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            // First message conversion throws, second succeeds
            mockConvertMessage
                .mockImplementationOnce(() => { throw new Error("Conversion failed"); })
                .mockReturnValueOnce(createMockActivity("activity2"));

            await handler.pullHistory();

            // HISTORY_BATCH_LOADED should still be dispatched
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
                ChatWidgetEvents.HISTORY_BATCH_LOADED,
                { messageCount: 2 }
            );
        });
    });

    describe("Null Activity Handling", () => {
        it("should skip null activities without crashing", async () => {
            const mockMessages = [createMockMessage("msg1"), createMockMessage("msg2")];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            // First returns null, second returns valid activity
            mockConvertMessage
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(createMockActivity("activity2"));

            await handler.pullHistory();

            // Only the valid activity should be dispatched (+ its divider + HISTORY_BATCH_LOADED)
            const addActivityCalls = mockDispatchCustomEvent.mock.calls.filter(
                (c: any[]) => c[0] === ChatWidgetEvents.ADD_ACTIVITY
            );
            expect(addActivityCalls.length).toBe(2); // activity2 + divider (since lastMessage is null)
        });

        it("should handle all-null activities gracefully", async () => {
            const mockMessages = [createMockMessage("msg1")];

            mockFacadeChatSDK.fetchPersistentConversationHistory.mockResolvedValue({
                chatMessages: mockMessages,
                nextPageToken: "token123"
            });

            mockConvertMessage.mockReturnValue(null);

            await handler.pullHistory();

            // No ADD_ACTIVITY should be dispatched, but HISTORY_BATCH_LOADED should still fire
            const addActivityCalls = mockDispatchCustomEvent.mock.calls.filter(
                (c: any[]) => c[0] === ChatWidgetEvents.ADD_ACTIVITY
            );
            expect(addActivityCalls.length).toBe(0);
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
                ChatWidgetEvents.HISTORY_BATCH_LOADED,
                { messageCount: 1 }
            );
        });
    });
});