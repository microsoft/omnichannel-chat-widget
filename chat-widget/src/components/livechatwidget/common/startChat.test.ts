/* eslint-disable @typescript-eslint/no-explicit-any */

import "@testing-library/jest-dom";

import { initStartChat, prepareStartChat, setPreChatAndInitiateChat } from "./startChat";

import { ActivityStreamHandler } from "./ActivityStreamHandler";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { cleanup } from "@testing-library/react";
import { createAdapter } from "./createAdapter";
import { createOnNewAdapterActivityHandler } from "../../../plugins/newMessageEventHandler";
import { handleStartChatError } from "./startChatErrorHandler";

// Mock dependencies
jest.mock("../../../plugins/newMessageEventHandler");
jest.mock("./createAdapter");
jest.mock("../../../common/telemetry/TelemetryHelper");
jest.mock("./ActivityStreamHandler");
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

// Mock other dependencies
jest.mock("./setPostChatContextAndLoadSurvey", () => ({
    setPostChatContextAndLoadSurvey: jest.fn()
}));

jest.mock("./updateSessionDataForTelemetry", () => ({
    updateTelemetryData: jest.fn()
}));

jest.mock("../../../common/utils", () => ({
    ...jest.requireActual("../../../common/utils"),
    createTimer: jest.fn(() => ({ start: jest.fn(), stop: jest.fn() })),
    getWidgetCacheIdfromProps: jest.fn(() => "test-widget-id"),
    getStateFromCache: jest.fn(() => null),
    checkContactIdError: jest.fn()
}));

jest.mock("../../../firstresponselatency/FirstMessageTrackerFromBot", () => ({
    createTrackingForFirstMessage: jest.fn()
}));

// Include logStartChatComplete in the mock; startChat.ts now calls it after facadeChatSDK.startChat.
// Previously missing this caused TypeError: logStartChatComplete is not a function when the real implementation was replaced.
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

jest.mock("../../../common/telemetry/TelemetryManager", () => ({
    TelemetryTimers: {
        WidgetLoadTimer: undefined
    }
}));

const mockCreateOnNewAdapterActivityHandler = createOnNewAdapterActivityHandler as jest.MockedFunction<typeof createOnNewAdapterActivityHandler>;
const mockCreateAdapter = createAdapter as jest.MockedFunction<typeof createAdapter>;
const mockTelemetryHelper = TelemetryHelper as jest.Mocked<typeof TelemetryHelper>;
const mockHandleStartChatError = handleStartChatError as jest.MockedFunction<typeof handleStartChatError>;

describe("startChat - startTime timing validation tests", () => {
    let mockFacadeChatSDK: jest.Mocked<FacadeChatSDK>;
    let mockDispatch: jest.Mock;
    let mockSetAdapter: jest.Mock;
    let mockAdapter: any;
    let mockChatToken: any;
    let realDateGetTime: () => number;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Store the real Date.getTime method
        realDateGetTime = Date.prototype.getTime;
        
        mockChatToken = {
            chatId: "test-chat-id-123",
            visitorId: "test-visitor-id-456"
        };

        mockAdapter = {
            activity$: {
                subscribe: jest.fn()
            }
        };

        mockFacadeChatSDK = {
            startChat: jest.fn().mockResolvedValue(undefined),
            getChatToken: jest.fn().mockResolvedValue(mockChatToken),
            getCurrentLiveChatContext: jest.fn().mockResolvedValue({}),
            getChatSDK: jest.fn().mockReturnValue({ requestId: "test-request-id" }),
            getPreChatSurvey: jest.fn().mockResolvedValue("")
        } as any;

        mockDispatch = jest.fn();
        mockSetAdapter = jest.fn();

        mockCreateAdapter.mockResolvedValue(mockAdapter);
        mockCreateOnNewAdapterActivityHandler.mockReturnValue(jest.fn());

        // Mock ActivityStreamHandler
        (ActivityStreamHandler as any).uncork = jest.fn();

        // Mock TelemetryHelper methods
        mockTelemetryHelper.logLoadingEventToAllTelemetry = jest.fn();
        mockTelemetryHelper.logSDKEvent = jest.fn();
        mockTelemetryHelper.logLoadingEvent = jest.fn();
    });

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
        // Restore the real Date.getTime method
        Date.prototype.getTime = realDateGetTime;
    });

    describe("initStartChat - startTime capture and timing", () => {
        it("should capture startTime immediately before facadeChatSDK.startChat() call", async () => {
            // Mock a fixed timestamp
            const fixedTimestamp = 1640995200000; // Fixed epoch timestamp
            jest.spyOn(Date.prototype, "getTime").mockReturnValue(fixedTimestamp);

            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            const params: StartChatOptionalParams = { isProactiveChat: false };

            // Execute the function
            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState, {}, params);

            // Verify that startChat was called
            expect(mockFacadeChatSDK.startChat).toHaveBeenCalledTimes(1);

            // Verify that createOnNewAdapterActivityHandler was called with the captured startTime
            expect(mockCreateOnNewAdapterActivityHandler).toHaveBeenCalledWith(
                mockChatToken.chatId,
                mockChatToken.visitorId,
                fixedTimestamp // The mocked timestamp
            );

            // Verify the startTime is passed correctly to the activity subscription
            expect(mockAdapter.activity$.subscribe).toHaveBeenCalled();
        });

        it("should capture startTime with correct call sequence", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify the sequence: startChat called first, then adapter creation with startTime
            const startChatCallOrder = mockFacadeChatSDK.startChat.mock.invocationCallOrder?.[0];
            const createAdapterCallOrder = mockCreateAdapter.mock.invocationCallOrder?.[0];
            const activityHandlerCallOrder = mockCreateOnNewAdapterActivityHandler.mock.invocationCallOrder?.[0];

            // Ensure proper call order exists
            expect(startChatCallOrder).toBeDefined();
            expect(createAdapterCallOrder).toBeDefined();
            expect(activityHandlerCallOrder).toBeDefined();

            // Verify startChat is called before adapter creation
            if (startChatCallOrder && createAdapterCallOrder) {
                expect(startChatCallOrder).toBeLessThan(createAdapterCallOrder);
            }
        });

        it("should capture different startTimes for multiple chat sessions", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // First call with timestamp 1640995200000
            const firstTimestamp = 1640995200000;
            jest.spyOn(Date.prototype, "getTime").mockReturnValue(firstTimestamp);
            
            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify first call uses first timestamp
            expect(mockCreateOnNewAdapterActivityHandler).toHaveBeenLastCalledWith(
                mockChatToken.chatId,
                mockChatToken.visitorId,
                firstTimestamp
            );

            // Mock different timestamp for second call
            const secondTimestamp = 1640995300000; // 100 seconds later
            jest.spyOn(Date.prototype, "getTime").mockReturnValue(secondTimestamp);

            // Reset mocks to track second call
            jest.clearAllMocks();
            mockCreateAdapter.mockResolvedValue(mockAdapter);
            mockCreateOnNewAdapterActivityHandler.mockReturnValue(jest.fn());
            mockFacadeChatSDK.startChat.mockResolvedValue(undefined);
            mockFacadeChatSDK.getChatToken.mockResolvedValue(mockChatToken);

            // Second call with different timestamp
            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify second call uses the new timestamp
            expect(mockCreateOnNewAdapterActivityHandler).toHaveBeenCalledWith(
                mockChatToken.chatId,
                mockChatToken.visitorId,
                secondTimestamp
            );
        });

        it("should not pass startTime to activity handler if startChat fails", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // Mock startChat to fail
            mockFacadeChatSDK.startChat.mockRejectedValue(new Error("Start chat failed"));

            // Should not throw but should call handleStartChatError
            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify that handleStartChatError was called due to failure
            expect(mockHandleStartChatError).toHaveBeenCalled();

            // Verify that createOnNewAdapterActivityHandler was not called due to failure
            expect(mockCreateOnNewAdapterActivityHandler).not.toHaveBeenCalled();
        });

        it("should not pass startTime to activity handler if chat token is missing", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // Mock getChatToken to return null
            mockFacadeChatSDK.getChatToken.mockResolvedValue(null);

            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify that createOnNewAdapterActivityHandler was not called
            expect(mockCreateOnNewAdapterActivityHandler).not.toHaveBeenCalled();
        });

        it("should handle partial chat token (missing chatId or visitorId)", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // Mock getChatToken to return incomplete token
            const incompleteChatToken = {
                chatId: "test-chat-id",
                visitorId: null // missing visitorId
            };
            mockFacadeChatSDK.getChatToken.mockResolvedValue(incompleteChatToken);

            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify that createOnNewAdapterActivityHandler was not called due to incomplete token
            expect(mockCreateOnNewAdapterActivityHandler).not.toHaveBeenCalled();
        });
    });

    describe("startTime precision and timing accuracy", () => {
        it("should capture startTime with millisecond precision", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // Use real Date.getTime() to test precision
            Date.prototype.getTime = realDateGetTime;
            const beforeTime = Date.now();
            
            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);
            
            const afterTime = Date.now();

            // Verify that the startTime passed to the handler is within the expected range
            const capturedStartTime = mockCreateOnNewAdapterActivityHandler.mock.calls[0]?.[2];
            expect(capturedStartTime).toBeGreaterThanOrEqual(beforeTime);
            expect(capturedStartTime).toBeLessThanOrEqual(afterTime);
            expect(typeof capturedStartTime).toBe("number");
        });

        it("should capture startTime closer to startChat() call than before", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // Track when Date.getTime() is called
            const capturedTimestamps: number[] = [];
            jest.spyOn(Date.prototype, "getTime").mockImplementation(() => {
                const timestamp = realDateGetTime.call(new Date());
                capturedTimestamps.push(timestamp);
                return timestamp;
            });

            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify that startTime was captured (Date.getTime was called)
            expect(capturedTimestamps.length).toBeGreaterThan(0);

            // Verify that the captured startTime matches what was passed to the handler
            const passedStartTime = mockCreateOnNewAdapterActivityHandler.mock.calls[0]?.[2];
            expect(capturedTimestamps).toContain(passedStartTime);
        });
    });

    describe("Edge cases and error scenarios", () => {
        it("should handle createAdapter failure gracefully", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            // Mock createAdapter to fail
            mockCreateAdapter.mockRejectedValue(new Error("Adapter creation failed"));

            // Should not throw but should call handleStartChatError
            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify startChat was still called successfully
            expect(mockFacadeChatSDK.startChat).toHaveBeenCalledTimes(1);

            // Verify that handleStartChatError was called due to adapter failure
            expect(mockHandleStartChatError).toHaveBeenCalled();
        });

        it("should handle persistent state correctly", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            const persistedState = {
                domainStates: {
                    liveChatContext: { chatId: "persisted-chat-id" }
                }
            };

            const fixedTimestamp = 1640995200000;
            jest.spyOn(Date.prototype, "getTime").mockReturnValue(fixedTimestamp);

            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState, {}, {}, persistedState);

            // Verify that even with persisted state, startTime is still captured and used
            expect(mockCreateOnNewAdapterActivityHandler).toHaveBeenCalledWith(
                mockChatToken.chatId,
                mockChatToken.visitorId,
                fixedTimestamp
            );
        });
    });

    describe("Integration with activity handler", () => {
        it("should pass startTime correctly to createOnNewAdapterActivityHandler", async () => {
            const mockState = {
                appStates: { 
                    conversationState: ConversationState.Loading,
                    chatDisconnectEventReceived: false
                },
                domainStates: { 
                    liveChatConfig: { 
                        LiveWSAndLiveChatEngJoin: { 
                            msdyn_conversationmode: "Standard" 
                        } 
                    } 
                }
            };

            const testTimestamp = 1641081600000; // New Year 2022
            jest.spyOn(Date.prototype, "getTime").mockReturnValue(testTimestamp);

            await initStartChat(mockFacadeChatSDK, mockDispatch, mockSetAdapter, mockState);

            // Verify the exact parameters passed to createOnNewAdapterActivityHandler
            expect(mockCreateOnNewAdapterActivityHandler).toHaveBeenCalledWith(
                "test-chat-id-123",  // chatId
                "test-visitor-id-456", // visitorId  
                testTimestamp // startTime - this is the key validation
            );

            // Verify the handler is subscribed to the activity stream
            expect(mockAdapter.activity$.subscribe).toHaveBeenCalledTimes(1);
        });
    });
});
