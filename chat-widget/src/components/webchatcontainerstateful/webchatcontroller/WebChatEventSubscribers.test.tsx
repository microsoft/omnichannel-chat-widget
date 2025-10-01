import "@testing-library/jest-dom";

import React, { act } from "react";
import { cleanup, render } from "@testing-library/react";

import ChatWidgetEvents from "../../livechatwidget/common/ChatWidgetEvents";
import { Constants } from "../../../common/Constants";
import { IPersistentChatHistoryProps } from "../../livechatwidget/interfaces/IPersistentChatHistoryProps";
import WebChatEventSubscribers from "./WebChatEventSubscribers";
import { WebChatStoreLoader } from "./WebChatStoreLoader";
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

// Mock WebChatStoreLoader
jest.mock("./WebChatStoreLoader", () => ({
    WebChatStoreLoader: {
        store: null
    }
}));

const mockDispatchCustomEvent = dispatchCustomEvent as jest.MockedFunction<typeof dispatchCustomEvent>;
const mockWebChatStoreLoader = WebChatStoreLoader as jest.Mocked<typeof WebChatStoreLoader>;

// Create spies for timer functions
let setIntervalSpy: jest.SpyInstance;
let setTimeoutSpy: jest.SpyInstance;
let clearIntervalSpy: jest.SpyInstance;

const defaultProps: IPersistentChatHistoryProps = {
    persistentChatHistoryEnabled: true
};

// Set up spies before all tests
beforeAll(() => {
    setIntervalSpy = jest.spyOn(global, "setInterval");
    setTimeoutSpy = jest.spyOn(global, "setTimeout");
    clearIntervalSpy = jest.spyOn(global, "clearInterval");
});

// Clean up spies after all tests
afterAll(() => {
    setIntervalSpy?.mockRestore();
    setTimeoutSpy?.mockRestore();
    clearIntervalSpy?.mockRestore();
});

describe("WebChatEventSubscribers", () => {
    const defaultProps: IPersistentChatHistoryProps = {
        persistentChatHistoryEnabled: true
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Reset WebChatStoreLoader
        mockWebChatStoreLoader.store = null;
        
        // Set up mock implementations for each test
        setIntervalSpy.mockImplementation((callback, delay) => {
            // Return a mock timer ID without executing the callback
            return 123 as any;
        });
        setTimeoutSpy.mockImplementation((callback, delay) => {
            // Return a mock timer ID without executing the callback
            return 456 as any;
        });
        clearIntervalSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        
        // Clear mock calls but don't restore spies
        setIntervalSpy?.mockClear();
        setTimeoutSpy?.mockClear();
        clearIntervalSpy?.mockClear();
    });

    describe("Component Rendering", () => {
        it("should render without throwing", () => {
            expect(() => {
                const defaultProps: IPersistentChatHistoryProps = {
                    persistentChatHistoryEnabled: true
                };
                render(<WebChatEventSubscribers {...defaultProps} />);
            }).not.toThrow();
        });

        it("should return undefined (no DOM output)", () => {
            const { container } = render(<WebChatEventSubscribers {...defaultProps} />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe("Connectivity Status Handling", () => {
        it("should not dispatch events when store is not available", () => {
            mockWebChatStoreLoader.store = null;
            
            render(<WebChatEventSubscribers {...defaultProps} />);
            
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });
        it("should set up store polling when store is not initially available", () => {
            mockWebChatStoreLoader.store = null;

            render(<WebChatEventSubscribers {...defaultProps} />);

            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it("should dispatch events when store becomes available and connection is established", () => {
            // Start with no store
            mockWebChatStoreLoader.store = null;

            render(<WebChatEventSubscribers {...defaultProps} />);

            // Simulate store becoming available
            mockWebChatStoreLoader.store = {
                getState: jest.fn().mockReturnValue({
                    connectivityStatus: "connected"
                })
            };

            // Simulate the interval check that finds the store
            act(() => {
                const storeCheckCallback = setIntervalSpy.mock.calls[0][0];
                storeCheckCallback();
            });

            // Should clear the interval when store is found
            expect(clearIntervalSpy).toHaveBeenCalled();
            // Should set up connection monitoring at 1000ms intervals
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

            // Simulate connection status check
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[1][0];
                connectionCheckCallback();
            });

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
        });

        it("should not dispatch events when persistent chat history is disabled", () => {
            const propsWithDisabledHistory = {
                ...defaultProps,
                persistentChatHistoryEnabled: false
            };

            render(<WebChatEventSubscribers {...propsWithDisabledHistory} />);

            expect(setIntervalSpy).not.toHaveBeenCalled();
            expect(setTimeoutSpy).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should not dispatch events when persistent chat history is undefined", () => {
            const propsWithUndefinedHistory = {
                persistentChatHistoryEnabled: undefined
            } as IPersistentChatHistoryProps;

            render(<WebChatEventSubscribers {...propsWithUndefinedHistory} />);

            expect(setIntervalSpy).not.toHaveBeenCalled();
            expect(setTimeoutSpy).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should handle null persistent chat history enabled", () => {
            const propsWithNullHistory = {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                persistentChatHistoryEnabled: null as any
            } as IPersistentChatHistoryProps;

            render(<WebChatEventSubscribers {...propsWithNullHistory} />);

            expect(setIntervalSpy).not.toHaveBeenCalled();
            expect(setTimeoutSpy).not.toHaveBeenCalled();
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });
    });

    describe("State Changes", () => {
        it("should respond to store availability changes", () => {
            // Start with no store
            mockWebChatStoreLoader.store = null;

            render(<WebChatEventSubscribers {...defaultProps} />);

            // Initially should set up polling
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);

            // Store becomes available
            mockWebChatStoreLoader.store = {
                getState: jest.fn().mockReturnValue({
                    connectivityStatus: "disconnected"
                })
            };

            // Execute the polling callback
            act(() => {
                const storeCheckCallback = setIntervalSpy.mock.calls[0][0];
                storeCheckCallback();
            });

            expect(clearIntervalSpy).toHaveBeenCalled();
        });

        it("should respond to persistent chat history enabled changes", () => {
            const propsDisabled = {
                persistentChatHistoryEnabled: false
            };

            const { rerender } = render(<WebChatEventSubscribers {...propsDisabled} />);

            // Initially disabled - no polling
            expect(setIntervalSpy).not.toHaveBeenCalled();

            // Enable persistent chat history
            rerender(<WebChatEventSubscribers {...defaultProps} />);

            // Should start polling for store
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
        });

        it("should handle connection state transitions", () => {
            // Set up store with disconnected state initially
            mockWebChatStoreLoader.store = {
                getState: jest.fn().mockReturnValue({
                    connectivityStatus: "disconnected"
                })
            };

            render(<WebChatEventSubscribers {...defaultProps} />);

            // Should set up connection monitoring
            expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

            // Execute connection check - first call (disconnected, no state change needed)
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            // Since the component starts with isConnected = false and status is disconnected, 
            // no timeout should be set yet
            expect(setTimeoutSpy).not.toHaveBeenCalled();

            // Change mock to return connected
            mockWebChatStoreLoader.store.getState.mockReturnValue({
                connectivityStatus: "connected"
            });

            // Execute connection check - second call (newly connected)
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            // Should now dispatch timeout for the new connection
            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);
        });
    });

    describe("Timeout Behavior", () => {
        it("should use 2000ms timeout for dispatching events when connected", () => {
            mockWebChatStoreLoader.store = {
                getState: jest.fn().mockReturnValue({
                    connectivityStatus: "connected"
                })
            };

            render(<WebChatEventSubscribers {...defaultProps} />);

            // Execute connection check
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

            // Execute timeout callback manually
            const timeoutCallback = setTimeoutSpy.mock.calls[0][0];
            timeoutCallback();

            expect(mockDispatchCustomEvent).toHaveBeenCalledTimes(2);
        });

        it("should not dispatch events if timeout callback is not executed", () => {
            mockWebChatStoreLoader.store = {
                getState: jest.fn().mockReturnValue({
                    connectivityStatus: "connected"
                })
            };

            render(<WebChatEventSubscribers {...defaultProps} />);

            // Execute connection check
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

            // Don't execute callback - events should not be dispatched
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });

        it("should handle multiple connection checks correctly", () => {
            const mockGetState = jest.fn()
                .mockReturnValueOnce({ connectivityStatus: "connected" }) // First call - already connected
                .mockReturnValueOnce({ connectivityStatus: "connected" }); // Second call - still connected

            mockWebChatStoreLoader.store = {
                getState: mockGetState
            };

            render(<WebChatEventSubscribers {...defaultProps} />);

            const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];

            // First check - newly connected (component starts with isConnected = false)
            act(() => {
                connectionCheckCallback();
            });
            expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

            // Second check - still connected (no new timeout)
            act(() => {
                connectionCheckCallback();
            });
            expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("Event Dispatching", () => {
        beforeEach(() => {
            mockWebChatStoreLoader.store = {
                getState: jest.fn().mockReturnValue({
                    connectivityStatus: "connected"
                })
            };
        });

        it("should dispatch FETCH_PERSISTENT_CHAT_HISTORY event first", () => {
            render(<WebChatEventSubscribers {...defaultProps} />);

            // Execute connection check to trigger timeout
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            const timeoutCallback = setTimeoutSpy.mock.calls[0][0];
            timeoutCallback();

            expect(mockDispatchCustomEvent).toHaveBeenNthCalledWith(1, ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY);
        });

        it("should dispatch ADD_ACTIVITY event with correct activity structure", () => {
            render(<WebChatEventSubscribers {...defaultProps} />);

            // Execute connection check to trigger timeout
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            const timeoutCallback = setTimeoutSpy.mock.calls[0][0];
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

            // Execute connection check to trigger timeout
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            const timeoutCallback = setTimeoutSpy.mock.calls[0][0];
            timeoutCallback();

            const addActivityCall = mockDispatchCustomEvent.mock.calls.find(
                call => call[0] === ChatWidgetEvents.ADD_ACTIVITY
            );

            expect(addActivityCall).toBeDefined();
            expect(addActivityCall?.[1]).toEqual({
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

            // Execute connection check to trigger timeout
            act(() => {
                const connectionCheckCallback = setIntervalSpy.mock.calls[0][0];
                connectionCheckCallback();
            });

            const timeoutCallback = setTimeoutSpy.mock.calls[0][0];
            timeoutCallback();

            const addActivityCall = mockDispatchCustomEvent.mock.calls.find(
                call => call[0] === ChatWidgetEvents.ADD_ACTIVITY
            );

            const activity = addActivityCall?.[1].activity;
            expect(activity.channelData.tags).toContain(Constants.persistentChatHistoryMessagePullTriggerTag);
            expect(activity.channelData.tags).toHaveLength(1);
        });
    });
});

describe("Dependencies Array", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockWebChatStoreLoader.store = null;
        
        // Set up mock implementations for each test
        setIntervalSpy.mockImplementation((callback, delay) => {
            return 123 as any;
        });
        setTimeoutSpy.mockImplementation((callback, delay) => {
            return 456 as any;
        });
        clearIntervalSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
        setIntervalSpy?.mockClear();
        setTimeoutSpy?.mockClear();
        clearIntervalSpy?.mockClear();
    });

    it("should set up store polling when persistent chat history is enabled", () => {
        mockWebChatStoreLoader.store = null;
        
        const testProps = { persistentChatHistoryEnabled: true };
        render(<WebChatEventSubscribers {...testProps} />);

        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
    });

    it("should not set up polling when persistent echat history is disabled", () => {
        const propsDisabled = { persistentChatHistoryEnabled: false };

        render(<WebChatEventSubscribers {...propsDisabled} />);

        expect(setIntervalSpy).not.toHaveBeenCalled();
    });

    it("should respond to props changes", () => {
        const propsDisabled = { persistentChatHistoryEnabled: false };
        const { rerender } = render(<WebChatEventSubscribers {...propsDisabled} />);

        expect(setIntervalSpy).not.toHaveBeenCalled();

        // Enable persistent chat history with fresh props
        const propsEnabled = { persistentChatHistoryEnabled: true };
        rerender(<WebChatEventSubscribers {...propsEnabled} />);

        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);
    });
});

describe("Edge Cases", () => {
    it("should handle empty props object", () => {
        // Ensure clean state
        mockWebChatStoreLoader.store = null;
        
        expect(() => {
            render(<WebChatEventSubscribers {...{}} />);
        }).not.toThrow();

        expect(setIntervalSpy).not.toHaveBeenCalled();
        expect(setTimeoutSpy).not.toHaveBeenCalled();
        expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
    });

    it("should handle store error gracefully", () => {
        // Start with no store, then make it available but with errors
        mockWebChatStoreLoader.store = null;
        
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        
        const testProps = { persistentChatHistoryEnabled: true };
        render(<WebChatEventSubscribers {...testProps} />);

        // Should set up store polling
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);

        // Make store available but with error-throwing getState
        mockWebChatStoreLoader.store = {
            getState: jest.fn(() => {
                throw new Error("Store error");
            })
        };

        // Execute store check first (this should find the store and trigger storeReady state)
        act(() => {
            const storeCheckCallback = setIntervalSpy.mock.calls[0][0];
            storeCheckCallback();
        });

        // Now should have connection monitoring interval set up
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

        // Execute connection check (this should throw the error)
        act(() => {
            const connectionCheckCallback = setIntervalSpy.mock.calls[1][0];
            connectionCheckCallback();
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            "[WebChatEventSubscribers] Connection status check failed:",
            expect.any(Error)
        );

        consoleSpy.mockRestore();
    });

    it("should handle undefined connectivity status", () => {
        // Start with no store
        mockWebChatStoreLoader.store = null;

        const testProps = { persistentChatHistoryEnabled: true };
        render(<WebChatEventSubscribers {...testProps} />);

        // Should set up store polling
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 100);

        // Make store available with undefined connectivity status
        mockWebChatStoreLoader.store = {
            getState: jest.fn().mockReturnValue({
                connectivityStatus: undefined
            })
        };

        // Execute store check first (this should find the store and trigger storeReady state)
        act(() => {
            const storeCheckCallback = setIntervalSpy.mock.calls[0][0];
            storeCheckCallback();
        });

        // Now should have connection monitoring interval set up
        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

        // Execute connection check (should not trigger timeout due to undefined status)
        act(() => {
            const connectionCheckCallback = setIntervalSpy.mock.calls[1][0];
            connectionCheckCallback();
        });

        expect(setTimeoutSpy).not.toHaveBeenCalled();
        expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
    });
});
