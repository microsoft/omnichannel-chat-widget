import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import {
    RecoveryEligibilityReason,
    getRecoveryEligibilityTelemetryProperties,
    logRecoveryEligibilityTelemetry
} from "./recoveryEligibilityTelemetry";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

const createState = (
    conversationState: unknown,
    liveChatContext?: unknown,
    reconnectId?: string
): ILiveChatWidgetContext => ({
    appStates: {
        conversationState,
        reconnectId
    },
    domainStates: {
        liveChatContext
    }
} as ILiveChatWidgetContext);

describe("getRecoveryEligibilityTelemetryProperties", () => {
    it.each(Object.values(ConversationState).filter((value) => typeof value === "number"))(
        "reports reconnectId precedence without changing state %s",
        (conversationState) => {
            expect(getRecoveryEligibilityTelemetryProperties(
                createState(conversationState, { requestId: "request-id" }, "reconnect-id"),
                true
            )).toMatchObject({
                hasReconnectId: true,
                hasLiveChatContext: true,
                hasRequestId: true,
                eligible: true,
                reason: RecoveryEligibilityReason.ReconnectIdPresent
            });
        }
    );

    it("reports the existing Active cached-context path", () => {
        expect(getRecoveryEligibilityTelemetryProperties(
            createState(ConversationState.Active, { requestId: "request-id" }),
            true
        )).toEqual({
            conversationState: "Active",
            hasReconnectId: false,
            hasLiveChatContext: true,
            hasRequestId: true,
            eligible: true,
            reason: RecoveryEligibilityReason.ActiveContextPresent
        });
    });

    it("reports Loading cached context as ineligible without changing recovery behavior", () => {
        expect(getRecoveryEligibilityTelemetryProperties(
            createState(ConversationState.Loading, { requestId: "request-id" }),
            false
        )).toEqual({
            conversationState: "Loading",
            hasReconnectId: false,
            hasLiveChatContext: true,
            hasRequestId: true,
            eligible: false,
            reason: RecoveryEligibilityReason.CachedContextNonActive
        });
    });

    it.each([
        [undefined, false],
        [null, false],
        [{}, false],
        [{ requestId: "" }, false],
        [{ requestId: "request-id" }, true]
    ])("reports cached requestId presence for context %#", (liveChatContext, hasRequestId) => {
        expect(getRecoveryEligibilityTelemetryProperties(
            createState(ConversationState.Loading, liveChatContext),
            false
        ).hasRequestId).toBe(hasRequestId);
    });

    it.each([undefined, "Active", 999])("maps malformed state %s to Unknown", (conversationState) => {
        expect(getRecoveryEligibilityTelemetryProperties(
            createState(conversationState, { requestId: "request-id" }),
            false
        )).toMatchObject({
            conversationState: "Unknown",
            eligible: false,
            reason: RecoveryEligibilityReason.CachedContextNonActive
        });
    });

    it("emits only the privacy-reviewed allowlist", () => {
        const properties = getRecoveryEligibilityTelemetryProperties(
            createState(ConversationState.Loading, { requestId: "sensitive-request-id" }),
            false
        );

        expect(Object.keys(properties).sort()).toEqual([
            "conversationState",
            "eligible",
            "hasLiveChatContext",
            "hasReconnectId",
            "hasRequestId",
            "reason"
        ]);
        expect(JSON.stringify(properties)).not.toContain("sensitive-request-id");
    });

    it("does not block initialization when telemetry dispatch fails", () => {
        const telemetrySpy = jest.spyOn(TelemetryHelper, "logActionEvent")
            .mockImplementation(() => {
                throw new Error("telemetry unavailable");
            });
        const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

        expect(() => logRecoveryEligibilityTelemetry(
            createState(ConversationState.Active, { requestId: "request-id" }),
            true
        )).not.toThrow();

        expect(telemetrySpy).toHaveBeenCalledTimes(1);
        consoleSpy.mockRestore();
        telemetrySpy.mockRestore();
    });
});
