import "@testing-library/jest-dom/extend-expect";
import { cleanup } from "@testing-library/react";
import { LogLevel, ScenarioType, TelemetryEvent } from "../TelemetryConstants";
import { consoleLogger } from "../loggers/consoleLogger";

describe("ConsoleLogger unit tests", () => {
    afterEach(() => {
        cleanup;
        jest.resetAllMocks();
    });

    it("Should call console.info in ConsoleLogger", () => {
        console.info = jest.fn();
        const testPayload = { Event: TelemetryEvent.StartChatFailed, Description: "test" };
        consoleLogger().log(LogLevel.INFO, { scenarioType: ScenarioType.LOAD, payload: testPayload });
        expect(console.info).toBeCalledTimes(1);
    });

    it("Should call console.error in ConsoleLogger", () => {
        console.error = jest.fn();
        const testPayload = { Event: TelemetryEvent.StartChatFailed, Description: "test" };
        consoleLogger().log(LogLevel.ERROR, { scenarioType: ScenarioType.LOAD, payload: testPayload });
        expect(console.error).toBeCalledTimes(1);
    });

    it("Should call console.warn in ConsoleLogger", () => {
        console.warn = jest.fn();
        const testPayload = { Event: TelemetryEvent.StartChatFailed, Description: "test" };
        consoleLogger().log(LogLevel.WARN, { scenarioType: ScenarioType.LOAD, payload: testPayload });
        expect(console.warn).toBeCalledTimes(1);
    });

    it("Should call console.debug in ConsoleLogger", () => {
        console.debug = jest.fn();
        const testPayload = { Event: TelemetryEvent.StartChatFailed, Description: "test" };
        consoleLogger().log(LogLevel.DEBUG, { scenarioType: ScenarioType.LOAD, payload: testPayload });
        expect(console.debug).toBeCalledTimes(1);
    });
});