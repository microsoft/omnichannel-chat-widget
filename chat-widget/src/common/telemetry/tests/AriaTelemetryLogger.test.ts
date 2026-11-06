import "@testing-library/jest-dom";

import { LogLevel, ScenarioType, TelemetryEvent, TelemetryInput } from "../TelemetryConstants";

import { ariaTelemetryLogger } from "../loggers/ariaTelemetryLogger";
import { AWTLogManager } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AriaSDK";
import { cleanup } from "@testing-library/react";
import { TelemetryHelper } from "../TelemetryHelper";

jest.mock("@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AriaSDK", () => ({
    AWTLogManager: {
        initialize: jest.fn(),
        getLogger: jest.fn(),
        flush: jest.fn()
    }
}));

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

    it("logs recovery eligibility fields as queryable scalar properties", () => {
        const logEvent = jest.fn();
        (AWTLogManager.initialize as jest.Mock).mockReturnValue({ logEvent });
        const recoveryProperties = {
            conversationState: "Loading",
            hasReconnectId: false,
            hasLiveChatContext: true,
            hasRequestId: true,
            eligible: false,
            reason: "CachedContextNonActive"
        };
        const telemetryInput: TelemetryInput = {
            scenarioType: ScenarioType.ACTIONS,
            payload: {
                Event: TelemetryEvent.RecoveryEligibilityEvaluated,
                CustomProperties: recoveryProperties,
                conversationState: recoveryProperties.conversationState,
                hasReconnectId: String(recoveryProperties.hasReconnectId),
                hasLiveChatContext: String(recoveryProperties.hasLiveChatContext),
                hasRequestId: String(recoveryProperties.hasRequestId),
                eligible: String(recoveryProperties.eligible),
                reason: recoveryProperties.reason
            }
        };
        telemetryInput.telemetryInfo = {
            telemetryInfo: TelemetryHelper.buildTelemetryEvent(LogLevel.INFO, telemetryInput)
        };

        ariaTelemetryLogger("test-key", true, "https://collector.example", "ApplicationName")
            .log(LogLevel.INFO, telemetryInput);

        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({
            properties: expect.objectContaining({
                conversationState: expect.objectContaining({ value: "Loading" }),
                hasReconnectId: expect.objectContaining({ value: "false" }),
                hasLiveChatContext: expect.objectContaining({ value: "true" }),
                hasRequestId: expect.objectContaining({ value: "true" }),
                eligible: expect.objectContaining({ value: "false" }),
                reason: expect.objectContaining({ value: "CachedContextNonActive" }),
                CustomProperties: expect.objectContaining({
                    value: JSON.stringify(recoveryProperties)
                })
            })
        }));
    });
});