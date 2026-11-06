import { AWTLogManager } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AriaSDK";
import { BroadcastService, BroadcastServiceInitialize } from "@microsoft/omnichannel-chat-components";
import { waitFor } from "@testing-library/react";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { logRecoveryEligibilityTelemetry } from "../../../components/livechatwidget/common/recoveryEligibilityTelemetry";
import { disposeLoggers, RegisterLoggers, TelemetryManager } from "../TelemetryManager";

jest.mock("@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AriaSDK", () => ({
    AWTLogManager: {
        initialize: jest.fn(),
        getLogger: jest.fn(),
        flush: jest.fn()
    }
}));

describe("RecoveryEligibilityEvaluated telemetry pipeline", () => {
    afterEach(() => {
        disposeLoggers();
        BroadcastService.disposeChannel();
        jest.resetAllMocks();
    });

    it("delivers queryable Loading-state fields to the Aria SDK", async () => {
        const logEvent = jest.fn();
        (AWTLogManager.initialize as jest.Mock).mockReturnValue({ logEvent });
        BroadcastServiceInitialize(`recovery-telemetry-${Date.now()}`);
        TelemetryManager.InternalTelemetryData = {
            telemetryConfig: {
                disableConsoleLog: true,
                telemetryDisabled: false
            },
            ariaConfig: {
                ariaTelemetryKey: "test-key",
                disableCookieUsage: true,
                collectorUriForTelemetry: "https://collector.example",
                ariaTelemetryApplicationName: "ApplicationName"
            },
            lcwRuntimeId: "runtime-id"
        } as typeof TelemetryManager.InternalTelemetryData;
        RegisterLoggers();

        logRecoveryEligibilityTelemetry({
            appStates: {
                conversationState: ConversationState.Loading
            },
            domainStates: {
                liveChatContext: {
                    requestId: "sensitive-request-id"
                }
            }
        } as ILiveChatWidgetContext, false);

        await waitFor(() => {
            expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({
                properties: expect.objectContaining({
                    Event: expect.objectContaining({ value: "RecoveryEligibilityEvaluated" }),
                    conversationState: expect.objectContaining({ value: "Loading" }),
                    hasReconnectId: expect.objectContaining({ value: "false" }),
                    hasLiveChatContext: expect.objectContaining({ value: "true" }),
                    hasRequestId: expect.objectContaining({ value: "true" }),
                    eligible: expect.objectContaining({ value: "false" }),
                    reason: expect.objectContaining({ value: "CachedContextNonActive" })
                })
            }));
        });
        expect(JSON.stringify(logEvent.mock.calls)).not.toContain("sensitive-request-id");
    });
});
