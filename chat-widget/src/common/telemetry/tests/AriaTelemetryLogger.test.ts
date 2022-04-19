import "@testing-library/jest-dom/extend-expect";
import { cleanup } from "@testing-library/react";
import { LogLevel, ScenarioType, TelemetryEvent } from "../TelemetryConstants";
import { ariaTelemetryLogger } from "../loggers/ariaTelemetryLogger";

describe("AriaTelemetryLogger unit tests", () => {
    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    it("Should call console.log in AriaTelemetryLogger when failed to initialize", () => {
        console.log = jest.fn();
        const testPayload = { Event: TelemetryEvent.StartChatFailed, Description: "test" };
        ariaTelemetryLogger("", true, "", "").log(LogLevel.INFO, { scenarioType: ScenarioType.LOAD, payload: testPayload });
        expect(console.log).toBeCalledTimes(1);
    });
});