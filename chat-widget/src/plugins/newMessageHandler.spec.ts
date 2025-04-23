import { Constants } from "../common/Constants";
import { ScenarioType } from "../firstresponselatency/Constants";
import { TelemetryHelper } from "../common/telemetry/TelemetryHelper";
import { createOnNewAdapterActivityHandler } from "./newMessageEventHandler";

jest.mock("@microsoft/omnichannel-chat-components");
jest.mock("../common/telemetry/TelemetryHelper");

describe("createOnNewAdapterActivityHandler", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let onNewAdapterActivityHandler: (activity: any) => void;

    beforeEach(() => {
        onNewAdapterActivityHandler = createOnNewAdapterActivityHandler("chatId", "userId");
        jest.clearAllMocks();
    });

    it("should invoke userSendMessageStrategy when scenarioType is UserSendMessageStrategy", () => {
        const activity = { type: Constants.message, text: "Hello" };
        const mockGetScenarioType = jest.fn().mockReturnValue(ScenarioType.UserSendMessageStrategy);
        jest.mock("../firstresponselatency/util", () => ({
            ...jest.requireActual("../firstresponselatency/util"),
            getScenarioType: mockGetScenarioType,
        }));

        onNewAdapterActivityHandler(activity);

        expect(mockGetScenarioType).toHaveBeenCalledWith(activity);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            Event: expect.any(String),
        }));
    });

    it("should invoke systemMessageStrategy when scenarioType is SystemMessageStrategy", () => {
        const activity = { type: Constants.message, text: "System message" };
        const mockGetScenarioType = jest.fn().mockReturnValue(ScenarioType.SystemMessageStrategy);
        jest.mock("../firstresponselatency/util", () => ({
            ...jest.requireActual("../firstresponselatency/util"),
            getScenarioType: mockGetScenarioType,
        }));

        onNewAdapterActivityHandler(activity);

        expect(mockGetScenarioType).toHaveBeenCalledWith(activity);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            Event: expect.any(String),
        }));
    });

    it("should invoke receivedMessageStrategy when scenarioType is ReceivedMessageStrategy", () => {
        const activity = { type: Constants.message, text: "Received message" };
        const mockGetScenarioType = jest.fn().mockReturnValue(ScenarioType.ReceivedMessageStrategy);
        jest.mock("../firstresponselatency/util", () => ({
            ...jest.requireActual("../firstresponselatency/util"),
            getScenarioType: mockGetScenarioType,
        }));

        onNewAdapterActivityHandler(activity);

        expect(mockGetScenarioType).toHaveBeenCalledWith(activity);
        expect(TelemetryHelper.logActionEvent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            Event: expect.any(String),
        }));
    });

    it("should not invoke any strategy if activity type is not Constants.message", () => {
        const activity = { type: "non-message-type" };

        onNewAdapterActivityHandler(activity);

        expect(TelemetryHelper.logActionEvent).not.toHaveBeenCalled();
    });
});