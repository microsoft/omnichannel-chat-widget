/* eslint-disable @typescript-eslint/no-explicit-any */

import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { FirstResponseLatencyTracker } from "./FirstResponseLatencyTracker";
import { MessagePayload } from "./Constants";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";

jest.mock("../common/telemetry/TelemetryHelper");

describe("FirstResponseLatencyTracker", () => {
    let tracker: FirstResponseLatencyTracker;

    beforeEach(() => {
        tracker = new FirstResponseLatencyTracker();
        jest.clearAllMocks();
        tracker["isReady"] = true; // Set isReady to true for testing
    });

    it("should start tracking when startClock is called with a valid payload", () => {
        const payload: MessagePayload = {
            Id: "123",
            role: "user",
            timestamp: Date.now().toString(),
            tags: [],
            messageType: "userMessage",
            text: "Hello",
            type: "",
            userId: "",
            isChatComplete: false
        };

        tracker.startClock(payload);

        expect((tracker as any).isTracking).toBe(true);
        expect((tracker as any).startTrackingMessage).toEqual(
            expect.objectContaining({
                Id: "123",
                role: "user",
                text: "Hello",
            })
        );
    });

    it("should not start tracking if the conversation is not a bot conversation", () => {
        const payload: MessagePayload = {
            Id: "123",
            role: "user",
            timestamp: Date.now().toString(),
            tags: [],
            messageType: "userMessage",
            text: "Hello",
            type: "userMessage",
            isChatComplete: false,
            userId: "userId",
        };

        (tracker as any).isABotConversation = false;
        tracker.startClock(payload);

        expect((tracker as any).isTracking).toBe(false);
    });

    it("should stop tracking when stopClock is called with a valid payload", () => {
        const startPayload: MessagePayload = {
            Id: "123",
            role: "user",
            timestamp: Date.now().toString(),
            tags: [],
            messageType: "userMessage",
            text: "Hello",
            type: "",
            userId: "",
            isChatComplete: false
        };

        const stopPayload: MessagePayload = {
            Id: "456",
            role: "bot",
            timestamp: Date.now().toString(),
            tags: [],
            messageType: "botMessage",
            text: "Hi there!",
            type: "",
            userId: "",
            isChatComplete: false
        };

        tracker.startClock(startPayload);
        tracker.stopClock(stopPayload);

        expect((tracker as any).isTracking).toBe(false);
        expect((tracker as any).stopTrackingMessage).toEqual(
            expect.objectContaining({
                Id: "456",
                role: "bot",
                text: "Hi there!",
            })
        );
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(LogLevel.INFO, expect.objectContaining({
            Event: TelemetryEvent.MessageLapTrack,
        }));
    });

    it("should reset state when deregister is called", () => {
        (tracker as any).isABotConversation = true;
        (tracker as any).isTracking = true;
        (tracker as any).startTrackingMessage = { Id: "123" } as any;
        (tracker as any).stopTrackingMessage = { Id: "456" } as any;

        (tracker as any).deregister();

        expect((tracker as any).isABotConversation).toBe(false);
        expect((tracker as any).isTracking).toBe(false);
        expect((tracker as any).startTrackingMessage).toBeUndefined();
        expect((tracker as any).stopTrackingMessage).toBeUndefined();
    });

    it("should log an error if startClock throws an exception", () => {
        const payload: MessagePayload = null as unknown as MessagePayload;
        tracker.startClock(payload);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(LogLevel.ERROR, expect.objectContaining({
            Event: TelemetryEvent.MessageStartLapTrackError,
        }));
    
    });

    it("should log an error if stopClock throws an exception", () => {
        const payload: MessagePayload = null as unknown as MessagePayload;
        tracker.stopClock(payload);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(LogLevel.ERROR, expect.objectContaining({
            Event: TelemetryEvent.MessageStopLapTrackError,
        }));
    });

    it("should reset state after 5 seconds if stopTracking is not called", async () => {
        jest.useFakeTimers();
        const payload: MessagePayload = {
            Id: "timeout-test",
            role: "user",
            timestamp: Date.now().toString(),
            tags: [],
            messageType: "userMessage",
            text: "Test timeout",
            type: "",
            userId: "",
            isChatComplete: false
        };

        tracker.startClock(payload);
        expect((tracker as any).isTracking).toBe(true);

        // Fast-forward 5 seconds
        jest.advanceTimersByTime(5000);
        await Promise.resolve();

        expect((tracker as any).isTracking).toBe(false);
        expect((tracker as any).startTrackingMessage).toBeUndefined();
        expect((tracker as any).stopTrackingMessage).toBeUndefined();
        expect(TelemetryHelper.logActionEvent).not.toHaveBeenCalledWith(LogLevel.INFO, expect.objectContaining({
            Event: TelemetryEvent.MessageLapTrack
        }));
        jest.useRealTimers();
    });
});