/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-empty-function */

import { LazyLoadHandler } from "./LazyLoadActivity";
import ChatWidgetEvents from "../../../../../livechatwidget/common/ChatWidgetEvents";

// Mock dependencies
jest.mock("../../../../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn(),
        logActionEventToAllTelemetry: jest.fn()
    }
}));

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        getMessageByEventName: jest.fn().mockReturnValue({
            subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() })
        })
    }
}));

jest.mock("../../../../../../common/utils/dispatchCustomEvent", () => jest.fn());
jest.mock("../../../../../../common/utils/SecureEventBus", () => ({
    __esModule: true,
    default: {
        getInstance: jest.fn().mockReturnValue({
            subscribe: jest.fn().mockReturnValue(jest.fn()),
            getAuthToken: jest.fn().mockReturnValue("mock-token"),
            dispatch: jest.fn().mockReturnValue(true)
        })
    }
}));

jest.mock("../../../../../../common/utils", () => ({
    createTimer: jest.fn().mockReturnValue({ milliSecondsElapsed: 0 })
}));

jest.mock("../../../../../livechatwidget/common/ChatWidgetEvents", () => ({
    __esModule: true,
    default: {
        ADD_ACTIVITY: "ADD_ACTIVITY",
        FETCH_PERSISTENT_CHAT_HISTORY: "FETCH_PERSISTENT_CHAT_HISTORY",
        NO_MORE_HISTORY_AVAILABLE: "NO_MORE_HISTORY_AVAILABLE",
        HISTORY_LOAD_ERROR: "HISTORY_LOAD_ERROR",
        HISTORY_BATCH_LOADED: "HISTORY_BATCH_LOADED"
    }
}));

const mockDispatchCustomEvent = require("../../../../../../common/utils/dispatchCustomEvent") as jest.MockedFunction<any>;

// Helper to create a mock scrollable container
function createMockContainer(overrides: Partial<HTMLElement> = {}): HTMLElement {
    const container = document.createElement("div");
    Object.defineProperty(container, "scrollHeight", { value: 1000, writable: true, configurable: true });
    Object.defineProperty(container, "clientHeight", { value: 400, writable: true, configurable: true });
    Object.defineProperty(container, "scrollTop", { value: 200, writable: true, configurable: true });
    container.style.overflow = "auto";
    Object.assign(container, overrides);
    return container;
}

describe("LazyLoadHandler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Reset all static state
        LazyLoadHandler.initialized = false;
        LazyLoadHandler.paused = false;
        LazyLoadHandler.observer = null;
        LazyLoadHandler.pendingScrollAction = false;
        LazyLoadHandler.initialLoadComplete = false;
        LazyLoadHandler.hasMoreHistoryAvailable = true;
        LazyLoadHandler.isReady = false;
        LazyLoadHandler.resetPending = false;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("handleLazyLoadTrigger", () => {
        it("should capture scroll state before dispatching fetch event", () => {
            const container = createMockContainer();
            Object.defineProperty(container, "scrollHeight", { value: 2000, configurable: true });
            Object.defineProperty(container, "scrollTop", { value: 300, configurable: true });

            // Mock findScrollContainer to return our mock container
            const originalFind = LazyLoadHandler.findScrollContainer;
            LazyLoadHandler.findScrollContainer = jest.fn().mockReturnValue({
                container,
                isScrollable: true
            });

            // Access private method via bracket notation
            (LazyLoadHandler as any).handleLazyLoadTrigger();

            expect(LazyLoadHandler.pendingScrollAction).toBe(true);
            expect(LazyLoadHandler.paused).toBe(true);
            expect(mockDispatchCustomEvent).toHaveBeenCalledWith(
                ChatWidgetEvents.FETCH_PERSISTENT_CHAT_HISTORY
            );

            LazyLoadHandler.findScrollContainer = originalFind;
        });

        it("should not trigger when hasMoreHistoryAvailable is false", () => {
            LazyLoadHandler.setHasMoreHistoryAvailable(false);

            (LazyLoadHandler as any).handleLazyLoadTrigger();

            expect(LazyLoadHandler.pendingScrollAction).toBe(false);
            expect(mockDispatchCustomEvent).not.toHaveBeenCalled();
        });
    });

    describe("applyScrollAnchor", () => {
        it("should calculate correct scroll position using height delta", () => {
            const container = createMockContainer();

            const originalFind = LazyLoadHandler.findScrollContainer;
            LazyLoadHandler.findScrollContainer = jest.fn().mockReturnValue({
                container,
                isScrollable: true
            });

            // Simulate: before load, scrollHeight was 1000, scrollTop was 200
            (LazyLoadHandler as any).preLoadScrollHeight = 800;
            (LazyLoadHandler as any).preLoadScrollTop = 200;

            // After load, scrollHeight is 1000 (from mock container)
            // heightDelta = 1000 - 800 = 200
            // newScrollTop = 200 + 200 = 400
            LazyLoadHandler.applyScrollAnchor();

            expect(container.scrollTop).toBe(400);
            LazyLoadHandler.findScrollContainer = originalFind;
        });

        it("should not change scrollTop when heightDelta is zero", () => {
            const container = createMockContainer();
            Object.defineProperty(container, "scrollHeight", { value: 1000, configurable: true });

            const originalFind = LazyLoadHandler.findScrollContainer;
            LazyLoadHandler.findScrollContainer = jest.fn().mockReturnValue({
                container,
                isScrollable: true
            });

            (LazyLoadHandler as any).preLoadScrollHeight = 1000; // Same as current
            (LazyLoadHandler as any).preLoadScrollTop = 200;

            LazyLoadHandler.applyScrollAnchor();

            // scrollTop should remain unchanged (200 from mock)
            expect(container.scrollTop).toBe(200);
            LazyLoadHandler.findScrollContainer = originalFind;
        });

        it("should call finishScrollAction when container is not scrollable", () => {
            const originalFind = LazyLoadHandler.findScrollContainer;
            LazyLoadHandler.findScrollContainer = jest.fn().mockReturnValue({
                container: null,
                isScrollable: false
            });

            LazyLoadHandler.pendingScrollAction = true;
            LazyLoadHandler.applyScrollAnchor();

            // finishScrollAction sets pendingScrollAction to false
            expect(LazyLoadHandler.pendingScrollAction).toBe(false);
            LazyLoadHandler.findScrollContainer = originalFind;
        });
    });

    describe("initialLoadComplete flag", () => {
        it("should be false initially", () => {
            expect(LazyLoadHandler.initialLoadComplete).toBe(false);
        });

        it("should be set to true by handleNoMoreHistoryAvailable", () => {
            LazyLoadHandler.handleNoMoreHistoryAvailable();
            expect(LazyLoadHandler.initialLoadComplete).toBe(true);
        });

        it("should NOT be reset by reset()", () => {
            LazyLoadHandler.initialLoadComplete = true;
            LazyLoadHandler.reset();

            // initialLoadComplete persists across observer cycles
            expect(LazyLoadHandler.initialLoadComplete).toBe(true);
        });

        it("should be reset by directReset() for new sessions", () => {
            LazyLoadHandler.initialLoadComplete = true;
            LazyLoadHandler.directReset();

            expect(LazyLoadHandler.initialLoadComplete).toBe(false);
        });
    });

    describe("handleNoMoreHistoryAvailable", () => {
        it("should set hasMoreHistoryAvailable to false", () => {
            LazyLoadHandler.handleNoMoreHistoryAvailable();
            expect(LazyLoadHandler.hasMoreHistoryAvailable).toBe(false);
        });

        it("should pause and clear pending scroll action", () => {
            LazyLoadHandler.pendingScrollAction = true;
            LazyLoadHandler.handleNoMoreHistoryAvailable();

            expect(LazyLoadHandler.paused).toBe(true);
            expect(LazyLoadHandler.pendingScrollAction).toBe(false);
        });

        it("should disconnect observer", () => {
            const mockObserver = {
                disconnect: jest.fn(),
                observe: jest.fn(),
                unobserve: jest.fn()
            };
            LazyLoadHandler.observer = mockObserver as any;

            LazyLoadHandler.handleNoMoreHistoryAvailable();

            expect(mockObserver.disconnect).toHaveBeenCalled();
            expect(LazyLoadHandler.observer).toBeNull();
        });

        it("should clear all pending timeouts", () => {
            // Add some timeouts via scheduleReset
            LazyLoadHandler.scheduleReset();

            // Verify timeouts exist
            const retryTimeouts = (LazyLoadHandler as any).retryTimeouts as Set<number>;
            expect(retryTimeouts.size).toBeGreaterThan(0);

            LazyLoadHandler.handleNoMoreHistoryAvailable();

            expect(retryTimeouts.size).toBe(0);
        });
    });

    describe("reset and unmount", () => {
        it("should reset state variables on unmount", () => {
            LazyLoadHandler.initialized = true;
            LazyLoadHandler.paused = true;
            LazyLoadHandler.pendingScrollAction = true;
            LazyLoadHandler.isReady = true;

            LazyLoadHandler.unmount();

            expect(LazyLoadHandler.initialized).toBe(false);
            expect(LazyLoadHandler.paused).toBe(false);
            expect(LazyLoadHandler.pendingScrollAction).toBe(false);
            expect(LazyLoadHandler.isReady).toBe(false);
            expect(LazyLoadHandler.observer).toBeNull();
        });

        it("should reset preLoad scroll values on unmount", () => {
            (LazyLoadHandler as any).preLoadScrollHeight = 1000;
            (LazyLoadHandler as any).preLoadScrollTop = 500;

            LazyLoadHandler.unmount();

            expect((LazyLoadHandler as any).preLoadScrollHeight).toBe(0);
            expect((LazyLoadHandler as any).preLoadScrollTop).toBe(0);
        });

        it("should clear all pending timeouts on unmount", () => {
            LazyLoadHandler.scheduleReset();
            const retryTimeouts = (LazyLoadHandler as any).retryTimeouts as Set<number>;
            expect(retryTimeouts.size).toBeGreaterThan(0);

            LazyLoadHandler.unmount();

            expect(retryTimeouts.size).toBe(0);
        });

        it("reset should reinitialize observer after delay", () => {
            const spy = jest.spyOn(LazyLoadHandler, "useLazyLoadObserver").mockImplementation(() => {});

            LazyLoadHandler.reset();

            // Advance past the reset timeout
            jest.advanceTimersByTime(100);

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe("findScrollContainer", () => {
        it("should return body as fallback when no containers exist", () => {
            const result = LazyLoadHandler.findScrollContainer();

            expect(result.container).toBe(document.body);
            expect(result.isScrollable).toBe(false);
        });
    });

    describe("setHasMoreHistoryAvailable", () => {
        it("should update hasMoreHistoryAvailable flag", () => {
            LazyLoadHandler.setHasMoreHistoryAvailable(false);
            expect(LazyLoadHandler.hasMoreHistoryAvailable).toBe(false);

            LazyLoadHandler.setHasMoreHistoryAvailable(true);
            expect(LazyLoadHandler.hasMoreHistoryAvailable).toBe(true);
        });
    });

    describe("moveScrollDown", () => {
        it("should delegate to applyScrollAnchor", () => {
            const spy = jest.spyOn(LazyLoadHandler, "applyScrollAnchor").mockImplementation(() => {});

            LazyLoadHandler.moveScrollDown();

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe("scheduleReset", () => {
        it("should call reset after timeout", () => {
            const spy = jest.spyOn(LazyLoadHandler, "reset").mockImplementation(() => {});

            LazyLoadHandler.scheduleReset();

            // Advance past the schedule timeout (1000ms)
            jest.advanceTimersByTime(1100);

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
