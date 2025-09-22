import "@testing-library/jest-dom";

import { cleanup, render } from "@testing-library/react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import React from "react";
import WebChatEventSubscribers from "./WebChatEventSubscribers";
import dispatchCustomEvent from "../../../common/utils/dispatchCustomEvent";

// Mock dependencies
jest.mock("../../../common/utils/dispatchCustomEvent");
jest.mock("../../livechatwidget/common/ChatWidgetEvents", () => ({
    FETCH_PERSISTENT_CHAT_HISTORY: "FETCH_PERSISTENT_CHAT_HISTORY",
    ADD_ACTIVITY: "ADD_ACTIVITY"
}));
jest.mock("../../../common/Constants", () => ({
    Constants: {
        persistentChatHistoryMessagePullTriggerTag: "persistent-chat-history-pull-trigger"
    }
}));

// Mock botframework-webchat-component hooks
const mockUseConnectivityStatus = jest.fn();
jest.mock("botframework-webchat-component", () => ({
    hooks: {
        useConnectivityStatus: () => mockUseConnectivityStatus()
    }
}));

const mockDispatchCustomEvent = dispatchCustomEvent as jest.MockedFunction<typeof dispatchCustomEvent>;

// Mock timers before any imports
const mockSetTimeout = jest.fn();
global.setTimeout = mockSetTimeout;

describe("WebChatEventSubscribers", () => {
    const defaultProps: IPersistentChatHistoryProps = {
        persistentChatHistoryEnabled: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSetTimeout.mockClear();
        mockUseConnectivityStatus.mockReturnValue(["disconnected"]);
    });

    afterEach(() => {
        cleanup();
    });

    describe("Component Rendering", () => {
        it("should render without throwing", () => {
            expect(() => {
                render(<WebChatEventSubscribers {...defaultProps} />);
            }).not.toThrow();
        });

        it("should return undefined (no DOM output)", () => {
            const { container } = render(<WebChatEventSubscribers {...defaultProps} />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe("Connectivity Status Handling", () => {
        it("should not dispatch events when disconnected", () => {
            mockUseConnectivityStatus.mockReturnValue(["disconnected"]);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should not dispatch events when connecting", () => {
            mockUseConnectivityStatus.mockReturnValue(["connecting"]);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should dispatch events when connected and persistent chat history is enabled", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
            
            // Execute the timeout callback manually
            const timeoutCallback = mockSetTimeout.mock.calls[0][0];
            timeoutCallback();
            
            expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(2);
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(1, ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(2, ChatWidgetEvents.ADD_ACTIVITY, {
                activity: {
                    from: {
                        role: "bot"
                    },
                    timestamp: 0,
                    type: "message",
                    channelData: {
                        tags: [Constants.persistentChatHistoryMessagePullTriggerTag]
                    }
                }
            });
        });

        it("should not dispatch events when persistent chat history is disabled", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const propsWithDisabledHistory = {
                ...defaultProps,
                persistentChatHistoryEnabled: false
            };
            
            render(<WebChatEventSubscribers {...propsWithDisabledHistory} />);
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should not dispatch events when persistent chat history is undefined", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const propsWithUndefinedHistory = {
                persistentChatHistoryEnabled: undefined
            } as IPersistentChatHistoryProps;
            
            render(<WebChatEventSubscribers {...propsWithUndefinedHistory} />);
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should handle null persistent chat history enabled", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const propsWithNullHistory = {
                persistentChatHistoryEnabled: null as any
            } as IPersistentChatHistoryProps;
            
            render(<WebChatEventSubscribers {...propsWithNullHistory} />);
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });
    });

    describe("State Changes", () => {
        it("should respond to connectivity status changes", () => {
            mockUseConnectivityStatus.mockReturnValue(["disconnected"]);
            
            const { rerender } = render(<WebChatEventSubscribers {...defaultProps} />);
            
            // Initially disconnected - no events
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
            
            // Change to connected
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
        });

        it("should respond to persistent chat history enabled changes", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const propsDisabled = {
                persistentChatHistoryEnabled: false
            };
            
            const { rerender } = render(<WebChatEventSubscribers {...propsDisabled} />);
            
            // Initially disabled - no events
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
            
            // Enable persistent chat history
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
        });

        it("should handle multiple state changes correctly", () => {
            mockUseConnectivityStatus.mockReturnValue(["disconnected"]);
            
            const { rerender } = render(<WebChatEventSubscribers {...defaultProps} />);
            
            // disconnected -> connecting
            mockUseConnectivityStatus.mockReturnValue(["connecting"]);
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
            
            // connecting -> connected
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
            
            // connected -> disconnected
            mockUseConnectivityStatus.mockReturnValue(["disconnected"]);
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            
            // Should not have additional timeout calls for disconnected state
            expect(mockSetTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe("Timeout Behavior", () => {
        it("should use 2000ms timeout for dispatching events", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
            
            // Execute timeout callback manually
            const timeoutCallback = mockSetTimeout.mock.calls[0][0];
            timeoutCallback();
            
            expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(2);
        });

        it("should not dispatch events if timeout callback is not executed", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
            
            // Don't execute callback - events should not be dispatched
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should handle multiple renders with timeouts correctly", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const { rerender } = render(<WebChatEventSubscribers {...defaultProps} />);
            
            // First render sets timeout
            expect(mockSetTimeout).toHaveBeenCalledTimes(1);
            
            // Rerender with same props - effect may or may not re-run depending on React's optimization
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            
            // The effect might not re-run if React optimizes away the render with identical props
            expect(mockSetTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe("Event Dispatching", () => {
        beforeEach(() => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
        });

        it("should dispatch FETCH_PERSISTENT_CHAT_HISTORY event first", () => {
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            const timeoutCallback = mockSetTimeout.mock.calls[0][0];
            timeoutCallback();
            
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(1, ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
        });

        it("should dispatch ADD_ACTIVITY event with correct activity structure", () => {
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            const timeoutCallback = mockSetTimeout.mock.calls[0][0];
            timeoutCallback();
            
            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(2, ChatWidgetEvents.ADD_ACTIVITY, {
                activity: {
                    from: {
                        role: "bot"
                    },
                    timestamp: 0,
                    type: "message",
                    channelData: {
                        tags: [Constants.persistentChatHistoryMessagePullTriggerTag]
                    }
                }
            });
        });

        it("should include correct activity properties", () => {
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            const timeoutCallback = mockSetTimeout.mock.calls[0][0];
            timeoutCallback();
            
            const addActivityCall = mockDispatchCustomEvent.mock.calls.find(
                call => call[0] === ChatWidgetEvents.ADD_ACTIVITY
            );
            
            expect(addActivityCall).toBeDefined();
            expect(addActivityCall![1]).toEqual({
                activity: {
                    from: { role: "bot" },
                    timestamp: 0,
                    type: "message",
                    channelData: {
                        tags: [Constants.persistentChatHistoryMessagePullTriggerTag]
                    }
                }
            });
        });

        it("should include correct constant tag", () => {
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            const timeoutCallback = mockSetTimeout.mock.calls[0][0];
            timeoutCallback();
            
            const addActivityCall = mockDispatchCustomEvent.mock.calls.find(
                call => call[0] === ChatWidgetEvents.ADD_ACTIVITY
            );
            
            const activity = addActivityCall![1].activity;
            expect(activity.channelData.tags).toContain(Constants.persistentChatHistoryMessagePullTriggerTag);
            expect(activity.channelData.tags).toHaveLength(1);
        });
    });

    describe("Dependencies Array", () => {
        it("should re-run effect when connectivity status changes", () => {
            mockUseConnectivityStatus.mockReturnValue(["disconnected"]);
            
            const { rerender } = render(<WebChatEventSubscribers {...defaultProps} />);
            
            // Change connectivity status
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            
            // Effect should have re-run
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
        });

        it("should re-run effect when persistentChatHistoryEnabled changes", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const propsDisabled = { persistentChatHistoryEnabled: false };
            const { rerender } = render(<WebChatEventSubscribers {...propsDisabled} />);
            
            // Change persistent chat history enabled
            rerender(<WebChatEventSubscribers {...defaultProps} />);
            
            // Effect should have re-run
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
        });

        it("should not re-run effect when unrelated props change", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            const props1 = { 
                ...defaultProps, 
                someOtherProp: "value1" 
            } as any;
            const props2 = { 
                ...defaultProps, 
                someOtherProp: "value2" 
            } as any;
            
            const { rerender } = render(<WebChatEventSubscribers {...props1} />);
            
            // First render should set timeout
            expect(mockSetTimeout).toHaveBeenCalledTimes(1);
            
            // Rerender with different unrelated prop - React may or may not re-run effect
            rerender(<WebChatEventSubscribers {...props2} />);
            
            // Since only the effect dependencies matter, timeout should only be called once
            expect(mockSetTimeout).toHaveBeenCalledTimes(1);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty props object", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected"]);
            
            expect(() => {
                render(<WebChatEventSubscribers {...{}} />);
            }).not.toThrow();
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should handle unknown connectivity status", () => {
            mockUseConnectivityStatus.mockReturnValue(["unknown" as any]);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should handle connectivity status as array with multiple values", () => {
            mockUseConnectivityStatus.mockReturnValue(["connected", "extra-value"] as any);
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(mockSetTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
        });
    });
});