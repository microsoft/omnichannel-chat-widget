/* eslint-disable @typescript-eslint/no-explicit-any */

import SecureEventBus from "./SecureEventBus";
import ChatWidgetEvents from "../../components/livechatwidget/common/ChatWidgetEvents";
import { TelemetryHelper } from "../telemetry/TelemetryHelper";

// Mock BroadcastService to prevent telemetry errors in tests
jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

// Mock TelemetryHelper to track telemetry calls
jest.mock("../telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn()
    }
}));

// Mock CustomEvent for Node.js test environment
(global as any).CustomEvent = class CustomEvent {
    type: string;
    eventInitDict?: any;
    
    constructor(type: string, eventInitDict?: any) {
        this.type = type;
        this.eventInitDict = eventInitDict;
    }
};

// Mock window.dispatchEvent
(global as any).window = {
    dispatchEvent: jest.fn()
};

describe("SecureEventBus", () => {
    let eventBus: SecureEventBus;

    beforeEach(() => {
        // Reset the singleton instance for each test
        (SecureEventBus as any).instance = null;
        eventBus = SecureEventBus.getInstance();
    });

    afterEach(() => {
        eventBus.clear();
    });

    describe("Security Features", () => {
        it("should block unauthorized event dispatch attempts", () => {
            const mockCallback = jest.fn();
            const mockTelemetryHelper = TelemetryHelper.logActionEvent as jest.Mock;
            mockTelemetryHelper.mockClear();
            
            eventBus.subscribe("test-event", mockCallback);
            
            // Try to dispatch with wrong token
            const result = eventBus.dispatch("test-event", { data: "test" }, "wrong-token");
            
            expect(result).toBe(false);
            expect(mockCallback).not.toHaveBeenCalled();
            expect(mockTelemetryHelper).toHaveBeenCalledWith(
                expect.any(String), // LogLevel.ERROR
                expect.objectContaining({
                    Description: expect.stringContaining("Unauthorized event dispatch attempt blocked: test-event")
                })
            );
        });

        it("should allow authenticated event dispatch", () => {
            const mockCallback = jest.fn();
            const testPayload = { data: "test" };
            
            eventBus.subscribe("test-event", mockCallback);
            
            // Dispatch with correct token
            const authToken = eventBus.getAuthToken();
            const result = eventBus.dispatch("test-event", testPayload, authToken);
            
            expect(result).toBe(true);
            expect(mockCallback).toHaveBeenCalledWith(testPayload);
        });

        it("should generate unique auth tokens across instances", () => {
            const token1 = eventBus.getAuthToken();
            
            // Create new instance
            (SecureEventBus as any).instance = null;
            const eventBus2 = SecureEventBus.getInstance();
            const token2 = eventBus2.getAuthToken();
            
            expect(token1).not.toBe(token2);
            expect(token1).toHaveLength(64); // 32 bytes * 2 hex chars
            expect(token2).toHaveLength(64);
        });

        it("should prevent external window event injection", () => {
            const mockCallback = jest.fn();
            
            // Subscribe to ADD_ACTIVITY event through secure bus
            eventBus.subscribe(ChatWidgetEvents.ADD_ACTIVITY, mockCallback);
            
            // Create a proper Event object that JSDOM can handle
            const maliciousEvent = new Event(ChatWidgetEvents.ADD_ACTIVITY);
            // Add the malicious payload as a custom property
            (maliciousEvent as any).detail = {
                payload: {
                    activity: {
                        text: "Malicious message",
                        from: { role: "bot", name: "Fake Agent" }
                    }
                }
            };
            
            // This should NOT trigger our secure callback since we don't listen to window events
            window.dispatchEvent(maliciousEvent);
            
            expect(mockCallback).not.toHaveBeenCalled();
        });
    });

    describe("Event Management", () => {
        it("should subscribe and unsubscribe properly", () => {
            const mockCallback = jest.fn();
            
            const unsubscribe = eventBus.subscribe("test-event", mockCallback);
            expect(eventBus.getListenerCount("test-event")).toBe(1);
            
            unsubscribe();
            expect(eventBus.getListenerCount("test-event")).toBe(0);
        });

        it("should handle multiple listeners for the same event", () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();
            const testPayload = { data: "test" };
            
            eventBus.subscribe("test-event", callback1);
            eventBus.subscribe("test-event", callback2);
            
            const authToken = eventBus.getAuthToken();
            eventBus.dispatch("test-event", testPayload, authToken);
            
            expect(callback1).toHaveBeenCalledWith(testPayload);
            expect(callback2).toHaveBeenCalledWith(testPayload);
        });

        it("should clean up empty listener arrays", () => {
            const mockCallback = jest.fn();
            
            const unsubscribe = eventBus.subscribe("test-event", mockCallback);
            expect(eventBus.getRegisteredEvents()).toContain("test-event");
            
            unsubscribe();
            expect(eventBus.getRegisteredEvents()).not.toContain("test-event");
        });

        it("should handle errors in listeners gracefully", () => {
            const mockTelemetryHelper = TelemetryHelper.logActionEvent as jest.Mock;
            mockTelemetryHelper.mockClear();
            const errorCallback = jest.fn(() => { throw new Error("Listener error"); });
            const normalCallback = jest.fn();
            
            eventBus.subscribe("test-event", errorCallback);
            eventBus.subscribe("test-event", normalCallback);
            
            const authToken = eventBus.getAuthToken();
            const result = eventBus.dispatch("test-event", {}, authToken);
            
            expect(result).toBe(true); // Should still return true
            expect(normalCallback).toHaveBeenCalled(); // Other listeners should still work
            expect(mockTelemetryHelper).toHaveBeenCalledWith(
                expect.any(String), // LogLevel.ERROR
                expect.objectContaining({
                    Description: expect.stringContaining("Error in event listener for event: test-event")
                })
            );
        });

        it("should return true when dispatching to events with no listeners", () => {
            const authToken = eventBus.getAuthToken();
            const result = eventBus.dispatch("non-existent-event", {}, authToken);
            
            expect(result).toBe(true);
        });
    });

    describe("Singleton Pattern", () => {
        it("should maintain singleton instance", () => {
            const instance1 = SecureEventBus.getInstance();
            const instance2 = SecureEventBus.getInstance();
            
            expect(instance1).toBe(instance2);
        });
    });

    describe("Utility Methods", () => {
        it("should provide correct listener count", () => {
            expect(eventBus.getListenerCount("test-event")).toBe(0);
            
            eventBus.subscribe("test-event", jest.fn());
            expect(eventBus.getListenerCount("test-event")).toBe(1);
            
            eventBus.subscribe("test-event", jest.fn());
            expect(eventBus.getListenerCount("test-event")).toBe(2);
        });

        it("should list registered events", () => {
            expect(eventBus.getRegisteredEvents()).toEqual([]);
            
            eventBus.subscribe("event1", jest.fn());
            eventBus.subscribe("event2", jest.fn());
            
            const events = eventBus.getRegisteredEvents();
            expect(events).toContain("event1");
            expect(events).toContain("event2");
            expect(events).toHaveLength(2);
        });

        it("should remove all listeners for specific event", () => {
            eventBus.subscribe("event1", jest.fn());
            eventBus.subscribe("event1", jest.fn());
            eventBus.subscribe("event2", jest.fn());
            
            expect(eventBus.getListenerCount("event1")).toBe(2);
            expect(eventBus.getListenerCount("event2")).toBe(1);
            
            eventBus.removeAllListeners("event1");
            
            expect(eventBus.getListenerCount("event1")).toBe(0);
            expect(eventBus.getListenerCount("event2")).toBe(1);
        });

        it("should clear all listeners", () => {
            eventBus.subscribe("event1", jest.fn());
            eventBus.subscribe("event2", jest.fn());
            
            expect(eventBus.getRegisteredEvents()).toHaveLength(2);
            
            eventBus.clear();
            
            expect(eventBus.getRegisteredEvents()).toHaveLength(0);
        });
    });
});