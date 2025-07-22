import { LogLevel, TelemetryEvent } from "../common/telemetry/TelemetryConstants";

import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { createTrackingForFirstMessage } from "./FirstMessageTrackerFromBot";

jest.mock("@microsoft/omnichannel-chat-components");
jest.mock("../common/telemetry/TelemetryHelper");

describe("createTrackingForFirstMessage", () => {
    let listeners: { [event: string]: any[] } = {};
    let postMessageMock: jest.Mock;

    beforeEach(() => {
        listeners = {};
        postMessageMock = jest.fn();
        (BroadcastService.getMessageByEventName as jest.Mock).mockImplementation((event: string) => ({
            subscribe: (cb: any) => {
                listeners[event] = listeners[event] || [];
                listeners[event].push(cb);
                return { unsubscribe: jest.fn() };
            }
        }));
        (BroadcastService.postMessage as any) = postMessageMock;
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    function trigger(event: string, payload: any) {
        (listeners[event] || []).forEach(cb => cb(payload));
    }

    it("should track and log first valid bot message", () => {
        createTrackingForFirstMessage();
        trigger(TelemetryEvent.WidgetLoadComplete, {});
        const message = { payload: { Id: "1", role: "bot", tags: [], messageType: "botMessage", text: "hi", type: "botMessage", userId: "bot", isChatComplete: false } };
        trigger("NewMessageReceived", message);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(LogLevel.INFO, expect.objectContaining({
            Event: TelemetryEvent.BotFirstMessageLapTrack,
            Description: expect.stringContaining("latency tracking"),
            CustomProperties: expect.objectContaining({
                botMessage: expect.objectContaining({ Id: "1" })
            })
        }));
    });

    it("should auto-timeout and log if no message in 5s", () => {
        createTrackingForFirstMessage();
        trigger(TelemetryEvent.WidgetLoadComplete, {});
        jest.advanceTimersByTime(5000);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(LogLevel.INFO, expect.objectContaining({
            Event: TelemetryEvent.BotFirstMessageLapTrack,
            Description: expect.stringContaining("timeout"),
            CustomProperties: expect.objectContaining({
                botMessage: expect.objectContaining({ messageType: "timeout" })
            })
        }));
    });

    it("should clean up if first message is from invalid sender", () => {
        createTrackingForFirstMessage();
        trigger(TelemetryEvent.WidgetLoadComplete, {});
        const message = { payload: { Id: "2", role: "agent", tags: ["public"], messageType: "userMessage", text: "agent msg", type: "userMessage", userId: "agent", isChatComplete: false } };
        trigger("NewMessageReceived", message);
        // Should not log bot message event
        expect(TelemetryHelper.logActionEvent).not.toHaveBeenCalledWith(LogLevel.INFO, expect.objectContaining({
            Event: TelemetryEvent.BotFirstMessageLapTrack,
            Description: expect.stringContaining("latency tracking")
        }));
    });
});
