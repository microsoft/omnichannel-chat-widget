import { Constants } from "../common/Constants";
import { FirstResponseLatencyTracker } from "../firstresponselatency/FirstResponseLatencyTracker";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { createOnNewAdapterActivityHandler } from "./newMessageEventHandler";

jest.mock("@microsoft/omnichannel-chat-components");
jest.mock("../common/telemetry/TelemetryHelper");
jest.mock("../firstresponselatency/FirstResponseLatencyTracker");

describe("createOnNewAdapterActivityHandler", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let onNewAdapterActivityHandler: (activity: any) => void;
    let mockStartClock: jest.Mock;
    let mockStopClock: jest.Mock;

    beforeEach(() => {
        mockStartClock = jest.fn();
        mockStopClock = jest.fn();

        (FirstResponseLatencyTracker as jest.Mock).mockImplementation(() => ({
            startClock: mockStartClock,
            stopClock: mockStopClock
        }));

        onNewAdapterActivityHandler = createOnNewAdapterActivityHandler("chatId", "userId");
        jest.clearAllMocks();
    });

    it("should invoke userSendMessageStrategy when scenarioType is UserSendMessageStrategy", () => {
        const activity = {
            type: Constants.message,
            text: "Hello",
            from: { role: Constants.userMessageTag }
        };

        onNewAdapterActivityHandler(activity);
        expect(TelemetryHelper.logActionEventToAllTelemetry).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            Event: expect.any(String),
        }));
    });

    it("should invoke systemMessageStrategy when scenarioType is SystemMessageStrategy", () => {
        const activity = {
            type: Constants.message,
            text: "System message",
            channelData: { tags: [Constants.systemMessageTag] }
        };
        onNewAdapterActivityHandler(activity);
        expect(TelemetryHelper.logActionEventToAllTelemetry).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            Event: expect.any(String),
        }));
    });

    it("should invoke receivedMessageStrategy when scenarioType is ReceivedMessageStrategy", () => {
        const activity = { type: Constants.message, text: "Received message" };

        onNewAdapterActivityHandler(activity);
        expect(TelemetryHelper.logActionEventToAllTelemetry).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            Event: expect.any(String),
        }));
    });

    it("should not invoke any strategy if activity type is not Constants.message", () => {
        const activity = { type: "non-message-type" };

        onNewAdapterActivityHandler(activity);

        expect(TelemetryHelper.logActionEventToAllTelemetry).not.toHaveBeenCalled();
    });
});