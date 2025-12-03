/* eslint-disable @typescript-eslint/no-explicit-any */

import ChatWidgetEvents from "../../components/livechatwidget/common/ChatWidgetEvents";
import SecureEventBus from "./SecureEventBus";
import dispatchCustomEvent from "./dispatchCustomEvent";

// Mock BroadcastService to prevent telemetry errors in tests
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

describe("dispatchCustomEvent Security Integration", () => {
    let eventBus: SecureEventBus;

    beforeEach(() => {
        // Reset the singleton instance for each test
        (SecureEventBus as any).instance = null;
        eventBus = SecureEventBus.getInstance();
        
        // Clear any previous listeners
        eventBus.clear();
    });

    afterEach(() => {
        eventBus.clear();
    });

    it("should successfully dispatch events through the secure event bus", () => {
        const mockCallback = jest.fn();
        const testPayload = { activity: { text: "Test message", id: "test-123" } };
        
        // Subscribe to the event
        eventBus.subscribe(ChatWidgetEvents.ADD_ACTIVITY, mockCallback);
        
        // Dispatch using our secure dispatchCustomEvent function
        dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, testPayload);
        
        // Verify the event was received
        expect(mockCallback).toHaveBeenCalledWith(testPayload);
    });

    it("should handle errors gracefully in dispatchCustomEvent", () => {
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        
        // This should not throw but should log an error
        dispatchCustomEvent("", null);
        
        consoleSpy.mockRestore();
    });

    it("should prevent external scripts from bypassing the secure system", () => {
        const mockCallback = jest.fn();
        
        // Subscribe through our secure system
        eventBus.subscribe(ChatWidgetEvents.ADD_ACTIVITY, mockCallback);
        
        // Simulate external script trying to use our dispatchCustomEvent function
        // This should work because it goes through our secure authentication
        dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, {
            activity: { text: "Legitimate internal message" }
        });
        
        expect(mockCallback).toHaveBeenCalledWith({
            activity: { text: "Legitimate internal message" }
        });
        
        // But external scripts can't bypass by directly calling the event bus without the token
        mockCallback.mockClear();
        const result = eventBus.dispatch(ChatWidgetEvents.ADD_ACTIVITY, {
            activity: { text: "Malicious external message" }
        }, "fake-token");
        
        expect(result).toBe(false);
        expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should maintain event isolation between different event types", () => {
        const addActivityCallback = jest.fn();
        const noMoreHistoryCallback = jest.fn();
        
        eventBus.subscribe(ChatWidgetEvents.ADD_ACTIVITY, addActivityCallback);
        eventBus.subscribe(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE, noMoreHistoryCallback);
        
        // Dispatch to ADD_ACTIVITY
        dispatchCustomEvent(ChatWidgetEvents.ADD_ACTIVITY, { activity: "test" });
        
        expect(addActivityCallback).toHaveBeenCalledWith({ activity: "test" });
        expect(noMoreHistoryCallback).not.toHaveBeenCalled();
        
        // Dispatch to NO_MORE_HISTORY_AVAILABLE
        dispatchCustomEvent(ChatWidgetEvents.NO_MORE_HISTORY_AVAILABLE);
        
        expect(noMoreHistoryCallback).toHaveBeenCalledWith(undefined);
        expect(addActivityCallback).toHaveBeenCalledTimes(1); // Should still be 1
    });
});