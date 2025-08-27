import "@testing-library/jest-dom";

import { LogLevel, ScenarioType, TelemetryEvent } from "../TelemetryConstants";

import { ariaTelemetryLogger } from "../loggers/ariaTelemetryLogger";
import { cleanup } from "@testing-library/react";

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