/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { BroadcastEvent, LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";
import { MessagePayload, ScenarioType } from "../firstresponselatency/Constants";
import { buildMessagePayload, getScenarioType, isHistoryMessage, polyfillMessagePayloadForEvent } from "../firstresponselatency/util";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { Constants } from "../common/Constants";
import { FirstResponseLatencyTracker } from "../firstresponselatency/FirstResponseLatencyTracker";
import { IActivity } from "botframework-directlinejs";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { TelemetryManager } from "../common/telemetry/TelemetryManager";
import { createOnNewAdapterActivityHandler } from "./newMessageEventHandler";

// Mock all dependencies
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

jest.mock("../firstresponselatency/util", () => ({
    buildMessagePayload: jest.fn(),
    getScenarioType: jest.fn(),
    isHistoryMessage: jest.fn(),
    polyfillMessagePayloadForEvent: jest.fn()
}));

jest.mock("../firstresponselatency/FirstResponseLatencyTracker");
jest.mock("../common/telemetry/TelemetryHelper");
jest.mock("../common/telemetry/TelemetryManager");

describe("createOnNewAdapterActivityHandler", () => {
    const mockChatId = "test-chat-id";
    const mockUserId = "test-user-id";
    const mockStartTime = 1640995200000; // Fixed epoch timestamp for testing
    
    let onNewAdapterActivityHandler: (activity: IActivity) => void;
    let mockStartClock: jest.Mock;
    let mockStopClock: jest.Mock;
    let mockBuildMessagePayload: jest.Mock;
    let mockGetScenarioType: jest.Mock;
    let mockIsHistoryMessage: jest.Mock;
    let mockPolyfillMessagePayloadForEvent: jest.Mock;
    let mockBroadcastServicePostMessage: jest.Mock;
    let mockTelemetryHelperLog: jest.Mock;

    const createMockActivity = (overrides: Partial<IActivity> = {}): IActivity => ({
        type: Constants.message,
        id: "test-activity-id",
        timestamp: new Date().toISOString(),
        from: { id: "test-from-id" },
        channelId: "test-channel",
        ...overrides
    } as any);

    const createMockPayload = (overrides: Partial<MessagePayload> = {}): MessagePayload => ({
        text: "test message",
        type: "message",
        timestamp: new Date().toISOString(),
        userId: mockUserId,
        tags: [],
        messageType: "",
        Id: "test-activity-id",
        role: undefined,
        chatId: mockChatId,
        conversationId: undefined,
        isChatComplete: false,
        ...overrides
    });

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        jest.resetAllMocks();

        // Setup FirstResponseLatencyTracker mock
        mockStartClock = jest.fn();
        mockStopClock = jest.fn();
        (FirstResponseLatencyTracker as jest.Mock).mockImplementation(() => ({
            startClock: mockStartClock,
            stopClock: mockStopClock
        }));

        // Setup util function mocks
        mockBuildMessagePayload = buildMessagePayload as jest.Mock;
        mockGetScenarioType = getScenarioType as jest.Mock;
        mockIsHistoryMessage = isHistoryMessage as jest.Mock;
        mockPolyfillMessagePayloadForEvent = polyfillMessagePayloadForEvent as jest.Mock;
        
        // Setup service mocks
        mockBroadcastServicePostMessage = BroadcastService.postMessage as jest.Mock;
        mockTelemetryHelperLog = TelemetryHelper.logActionEventToAllTelemetry as jest.Mock;

        // Setup default return values
        mockBuildMessagePayload.mockReturnValue(createMockPayload());
        mockPolyfillMessagePayloadForEvent.mockReturnValue(createMockPayload());
        mockIsHistoryMessage.mockReturnValue(false);
        
        // Setup TelemetryManager mock
        (TelemetryManager as any).InternalTelemetryData = {
            conversationId: "test-conversation-id"
        };

        // Create the handler
        onNewAdapterActivityHandler = createOnNewAdapterActivityHandler(mockChatId, mockUserId, mockStartTime);
    });

    describe("Activity filtering", () => {
        it("should only process message type activities", () => {
            const nonMessageActivity = createMockActivity({ type: "typing" });
            
            onNewAdapterActivityHandler(nonMessageActivity);
            
            expect(mockGetScenarioType).not.toHaveBeenCalled();
            expect(mockBroadcastServicePostMessage).not.toHaveBeenCalled();
            expect(mockTelemetryHelperLog).not.toHaveBeenCalled();
        });

        it("should process message type activities", () => {
            const messageActivity = createMockActivity();
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
            
            onNewAdapterActivityHandler(messageActivity);
            
            expect(mockGetScenarioType).toHaveBeenCalledWith(messageActivity);
        });
    });

    describe("UserSendMessageStrategy", () => {
        beforeEach(() => {
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
        });

        it("should handle user sent messages correctly", () => {
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            mockPolyfillMessagePayloadForEvent.mockReturnValue(mockPayload);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockBuildMessagePayload).toHaveBeenCalledWith(activity, mockUserId);
            expect(mockPayload.messageType).toBe(Constants.userMessageTag);
            expect(mockBroadcastServicePostMessage).toHaveBeenCalledWith({
                eventName: BroadcastEvent.NewMessageSent,
                payload: mockPayload
            });
            expect(mockTelemetryHelperLog).toHaveBeenCalledWith(LogLevel.INFO, {
                Event: TelemetryEvent.MessageSent,
                Description: "New message sent"
            });
        });

        it("should start latency tracker for non-history user messages", () => {
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            mockIsHistoryMessage.mockReturnValue(false);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockIsHistoryMessage).toHaveBeenCalledWith(activity, mockStartTime);
            expect(mockStartClock).toHaveBeenCalledWith(mockPayload);
        });

        it("should not start latency tracker for history user messages", () => {
            const activity = createMockActivity();
            mockIsHistoryMessage.mockReturnValue(true);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockStartClock).not.toHaveBeenCalled();
        });
    });

    describe("SystemMessageStrategy", () => {
        beforeEach(() => {
            mockGetScenarioType.mockReturnValue(ScenarioType.SystemMessageStrategy);
        });

        it("should handle system messages as history messages", () => {
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            mockPolyfillMessagePayloadForEvent.mockReturnValue(mockPayload);
            mockIsHistoryMessage.mockReturnValue(true);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockBuildMessagePayload).toHaveBeenCalledWith(activity, mockUserId);
            expect(mockPayload.messageType).toBe(Constants.systemMessageTag);
            expect(mockBroadcastServicePostMessage).toHaveBeenCalledWith({
                eventName: BroadcastEvent.HistoryMessageReceived,
                payload: mockPayload
            });
            // Should not log SystemMessageReceived telemetry for history messages
            expect(mockTelemetryHelperLog).not.toHaveBeenCalledWith(LogLevel.INFO, {
                Event: TelemetryEvent.SystemMessageReceived,
                Description: "System message received"
            });
        });

        it("should handle system messages as new messages", () => {
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            mockPolyfillMessagePayloadForEvent.mockReturnValue(mockPayload);
            mockIsHistoryMessage.mockReturnValue(false);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockBuildMessagePayload).toHaveBeenCalledWith(activity, mockUserId);
            expect(mockPayload.messageType).toBe(Constants.systemMessageTag);
            expect(mockBroadcastServicePostMessage).toHaveBeenCalledWith({
                eventName: BroadcastEvent.NewMessageReceived,
                payload: mockPayload
            });
            expect(mockTelemetryHelperLog).toHaveBeenCalledWith(LogLevel.INFO, {
                Event: TelemetryEvent.SystemMessageReceived,
                Description: "System message received"
            });
        });
    });

    describe("ReceivedMessageStrategy", () => {
        beforeEach(() => {
            mockGetScenarioType.mockReturnValue(ScenarioType.ReceivedMessageStrategy);
        });

        describe("Message validation", () => {
            it("should process valid messages with text", () => {
                const activity = createMockActivity({ text: "Hello world" } as any);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).toHaveBeenCalled();
            });

            it("should process valid messages with tags", () => {
                const activity = createMockActivity({ 
                    text: "",
                    channelData: { tags: ["some-tag"] }
                } as any);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).toHaveBeenCalled();
            });

            it("should process valid messages with attachments", () => {
                const activity = createMockActivity({ 
                    text: "",
                    attachments: [{ contentType: "image/png", content: {} }]
                } as any);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).toHaveBeenCalled();
            });

            it("should skip invalid messages without text, tags, or attachments", () => {
                const activity = createMockActivity({ 
                    text: "",
                    channelData: { tags: [] },
                    attachments: []
                } as any);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).not.toHaveBeenCalled();
                expect(mockBroadcastServicePostMessage).not.toHaveBeenCalled();
            });

            it("should skip messages with no text and undefined channelData", () => {
                const activity = createMockActivity({ 
                    text: "",
                    channelData: undefined,
                    attachments: []
                } as any);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).not.toHaveBeenCalled();
            });

            it("should skip messages with no text and no tags", () => {
                const activity = createMockActivity({ 
                    text: "",
                    channelData: {},
                    attachments: []
                } as any);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).not.toHaveBeenCalled();
            });
        });

        describe("History message handling", () => {
            it("should handle received messages as history messages", () => {
                // Ensure activity is valid (has text)
                const activity = createMockActivity({ text: "history message" } as any);
                const mockPayload = createMockPayload();
                mockBuildMessagePayload.mockReturnValue(mockPayload);
                mockPolyfillMessagePayloadForEvent.mockReturnValue(mockPayload);
                mockIsHistoryMessage.mockReturnValue(true);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockBuildMessagePayload).toHaveBeenCalledWith(activity, mockUserId);
                expect(mockPayload.messageType).toBe(Constants.userMessageTag);
                expect(mockBroadcastServicePostMessage).toHaveBeenCalledWith({
                    eventName: BroadcastEvent.HistoryMessageReceived,
                    payload: mockPayload
                });
                expect(mockStopClock).not.toHaveBeenCalled();
            });
        });

        describe("New message handling", () => {
            it("should handle received messages as new messages", () => {
                // Ensure activity is valid (has text)
                const activity = createMockActivity({ text: "new message" } as any);
                const mockPayload = createMockPayload();
                mockBuildMessagePayload.mockReturnValue(mockPayload);
                mockPolyfillMessagePayloadForEvent.mockReturnValue(mockPayload);
                mockIsHistoryMessage.mockReturnValue(false);
                
                onNewAdapterActivityHandler(activity);
                
                expect(mockStopClock).toHaveBeenCalledWith(mockPayload);
                expect(mockBroadcastServicePostMessage).toHaveBeenCalledWith({
                    eventName: BroadcastEvent.NewMessageReceived,
                    payload: mockPayload
                });
                expect(mockTelemetryHelperLog).toHaveBeenCalledWith(LogLevel.INFO, {
                    Event: TelemetryEvent.MessageReceived,
                    Description: "New message received",
                    CustomProperties: mockPayload
                });
            });
        });
    });

    describe("History message strategy", () => {
        beforeEach(() => {
            mockGetScenarioType.mockReturnValue(ScenarioType.ReceivedMessageStrategy);
            mockIsHistoryMessage.mockReturnValue(true);
        });

        it("should log RehydrateMessageReceived telemetry only for the first history message", () => {
            // Ensure activities are valid (have text)
            const activity1 = createMockActivity({ id: "activity-1", text: "history 1" } as any);
            const activity2 = createMockActivity({ id: "activity-2", text: "history 2" } as any);
            const mockPayload1 = createMockPayload({ Id: "activity-1" });
            const mockPayload2 = createMockPayload({ Id: "activity-2" });
            
            mockBuildMessagePayload
                .mockReturnValueOnce(mockPayload1)
                .mockReturnValueOnce(mockPayload2);
            mockPolyfillMessagePayloadForEvent
                .mockReturnValueOnce(mockPayload1)
                .mockReturnValueOnce(mockPayload2);
            
            // First history message
            onNewAdapterActivityHandler(activity1);
            
            expect(mockTelemetryHelperLog).toHaveBeenCalledWith(LogLevel.INFO, {
                Event: TelemetryEvent.RehydrateMessageReceived,
                Description: "History message received",
                CustomProperties: mockPayload1
            });
            
            // Reset mock to verify second call behavior
            mockTelemetryHelperLog.mockClear();
            
            // Second history message
            onNewAdapterActivityHandler(activity2);
            
            // Should not log RehydrateMessageReceived again
            expect(mockTelemetryHelperLog).not.toHaveBeenCalledWith(LogLevel.INFO, {
                Event: TelemetryEvent.RehydrateMessageReceived,
                Description: "History message received",
                CustomProperties: mockPayload2
            });
        });

        it("should always broadcast HistoryMessageReceived events", () => {
            // Ensure activities are valid (have text)
            const activity1 = createMockActivity({ id: "activity-1", text: "history 1" } as any);
            const activity2 = createMockActivity({ id: "activity-2", text: "history 2" } as any);
            const mockPayload1 = createMockPayload({ Id: "activity-1" });
            const mockPayload2 = createMockPayload({ Id: "activity-2" });
            
            mockBuildMessagePayload
                .mockReturnValueOnce(mockPayload1)
                .mockReturnValueOnce(mockPayload2);
            mockPolyfillMessagePayloadForEvent
                .mockReturnValueOnce(mockPayload1)
                .mockReturnValueOnce(mockPayload2);
            
            onNewAdapterActivityHandler(activity1);
            onNewAdapterActivityHandler(activity2);
            
            expect(mockBroadcastServicePostMessage).toHaveBeenCalledTimes(2);
            expect(mockBroadcastServicePostMessage).toHaveBeenNthCalledWith(1, {
                eventName: BroadcastEvent.HistoryMessageReceived,
                payload: mockPayload1
            });
            expect(mockBroadcastServicePostMessage).toHaveBeenNthCalledWith(2, {
                eventName: BroadcastEvent.HistoryMessageReceived,
                payload: mockPayload2
            });
        });
    });

    describe("FirstResponseLatencyTracker integration", () => {
        it("should create a new FirstResponseLatencyTracker instance", () => {
            expect(FirstResponseLatencyTracker).toHaveBeenCalledTimes(1);
        });

        it("should start latency tracking for user sent messages", () => {
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
            mockIsHistoryMessage.mockReturnValue(false);
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockStartClock).toHaveBeenCalledWith(mockPayload);
        });

        it("should stop latency tracking for received messages", () => {
            mockGetScenarioType.mockReturnValue(ScenarioType.ReceivedMessageStrategy);
            mockIsHistoryMessage.mockReturnValue(false);
            // Ensure activity is valid (has text)
            const activity = createMockActivity({ text: "received message" } as any);
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockStopClock).toHaveBeenCalledWith(mockPayload);
        });

        it("should not affect latency tracking for system messages", () => {
            mockGetScenarioType.mockReturnValue(ScenarioType.SystemMessageStrategy);
            mockIsHistoryMessage.mockReturnValue(false);
            const activity = createMockActivity();
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockStartClock).not.toHaveBeenCalled();
            expect(mockStopClock).not.toHaveBeenCalled();
        });
    });

    describe("TelemetryManager integration", () => {
        it("should use conversation ID from TelemetryManager in polyfill calls", () => {
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            
            onNewAdapterActivityHandler(activity);
            
            expect(mockPolyfillMessagePayloadForEvent).toHaveBeenCalledWith(
                activity,
                mockPayload,
                "test-conversation-id"
            );
        });

        it("should handle undefined TelemetryManager gracefully", () => {
            (TelemetryManager as any).InternalTelemetryData = undefined;
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
            const activity = createMockActivity();
            const mockPayload = createMockPayload();
            mockBuildMessagePayload.mockReturnValue(mockPayload);
            
            expect(() => {
                onNewAdapterActivityHandler(activity);
            }).not.toThrow();
            
            expect(mockPolyfillMessagePayloadForEvent).toHaveBeenCalledWith(
                activity,
                mockPayload,
                undefined
            );
        });
    });

    describe("Error handling", () => {
        it("should handle errors in buildMessagePayload gracefully", () => {
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
            mockBuildMessagePayload.mockImplementation(() => {
                throw new Error("Build payload error");
            });
            const activity = createMockActivity();
            
            expect(() => {
                onNewAdapterActivityHandler(activity);
            }).toThrow("Build payload error");
        });

        it("should handle errors in BroadcastService gracefully", () => {
            mockGetScenarioType.mockReturnValue(ScenarioType.UserSendMessageStrategy);
            mockBroadcastServicePostMessage.mockImplementation(() => {
                throw new Error("Broadcast error");
            });
            const activity = createMockActivity();
            
            expect(() => {
                onNewAdapterActivityHandler(activity);
            }).toThrow("Broadcast error");
        });
    });
});
