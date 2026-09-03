import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import {
    RecoveryEligibilityReason,
    evaluateRecoveryEligibility,
    getRecoveryEligibilityTelemetryProperties
} from "./recoveryEligibility";

function createState(
    conversationState: unknown,
    liveChatContext?: unknown,
    reconnectId?: string
): ILiveChatWidgetContext {
    const cachedContext = arguments.length > 1
        ? liveChatContext
        : { requestId: "cached-request-id" };

    return {
        appStates: {
            conversationState,
            reconnectId
        },
        domainStates: {
            liveChatContext: cachedContext
        }
    } as ILiveChatWidgetContext;
}

describe("evaluateRecoveryEligibility", () => {
    const eligibleCachedStates = new Set([
        ConversationState.Active,
        ConversationState.Loading
    ]);
    const unsupportedCachedStates = Object.values(ConversationState)
        .filter((value): value is ConversationState =>
            typeof value === "number" && !eligibleCachedStates.has(value));

    it.each(Object.values(ConversationState).filter((value) => typeof value === "number"))(
        "prioritizes reconnectId for conversation state %s",
        (conversationState) => {
            const liveChatContext = { requestId: "cached-request-id" };
            const decision = evaluateRecoveryEligibility(
                createState(conversationState, liveChatContext, "reconnect-id")
            );

            expect(decision).toMatchObject({
                eligible: true,
                optionalParams: { reconnectId: "reconnect-id" },
                hasReconnectId: true,
                hasLiveChatContext: true,
                hasRequestId: true,
                reason: RecoveryEligibilityReason.ReconnectIdPresent
            });
        }
    );

    it("prioritizes reconnectId when cached context is absent", () => {
        expect(evaluateRecoveryEligibility(
            createState(ConversationState.Prechat, null, "reconnect-id")
        )).toMatchObject({
            eligible: true,
            optionalParams: { reconnectId: "reconnect-id" },
            hasReconnectId: true,
            hasLiveChatContext: false,
            hasRequestId: false,
            reason: RecoveryEligibilityReason.ReconnectIdPresent
        });
    });

    it.each([
        [ConversationState.Active, RecoveryEligibilityReason.ActiveContextPresent],
        [ConversationState.Loading, RecoveryEligibilityReason.LoadingContextPresent]
    ])("validates cached context in %s state", (conversationState, reason) => {
        const liveChatContext = { requestId: "cached-request-id" };
        const decision = evaluateRecoveryEligibility(createState(conversationState, liveChatContext));

        expect(decision).toMatchObject({
            eligible: true,
            optionalParams: { liveChatContext },
            hasReconnectId: false,
            hasLiveChatContext: true,
            hasRequestId: true,
            reason
        });
    });

    it("keeps requestId-only cached context eligible for validation", () => {
        const liveChatContext = { requestId: "cached-request-id" };

        expect(evaluateRecoveryEligibility(
            createState(ConversationState.Loading, liveChatContext)
        ).optionalParams).toEqual({ liveChatContext });
    });

    it.each(unsupportedCachedStates)("does not recover cached context in state %s", (conversationState) => {
        expect(evaluateRecoveryEligibility(createState(conversationState))).toMatchObject({
            eligible: false,
            reason: RecoveryEligibilityReason.UnsupportedState
        });
    });

    it.each([
        [undefined, RecoveryEligibilityReason.MissingContext],
        [null, RecoveryEligibilityReason.MissingContext],
        ["invalid", RecoveryEligibilityReason.MissingContext],
        [{}, RecoveryEligibilityReason.MissingRequestId],
        [{ requestId: "" }, RecoveryEligibilityReason.MissingRequestId],
        [{ requestId: "   " }, RecoveryEligibilityReason.MissingRequestId]
    ])("fails closed for invalid context %#", (liveChatContext, reason) => {
        expect(evaluateRecoveryEligibility(
            createState(ConversationState.Loading, liveChatContext)
        )).toMatchObject({
            eligible: false,
            reason
        });
    });

    it.each([undefined, "Loading", 999])("fails closed for malformed state %s", (conversationState) => {
        const decision = evaluateRecoveryEligibility(createState(conversationState));

        expect(decision).toMatchObject({
            eligible: false,
            conversationState: "Unknown",
            reason: RecoveryEligibilityReason.UnsupportedState
        });
        expect(Object.values(RecoveryEligibilityReason)).toContain(decision.reason);
    });

    it("treats whitespace-only reconnectId as absent", () => {
        expect(evaluateRecoveryEligibility(
            createState(ConversationState.Prechat, null, "   ")
        )).toMatchObject({
            eligible: false,
            hasReconnectId: false,
            reason: RecoveryEligibilityReason.MissingContext
        });
    });

    it("emits only privacy-safe decision properties", () => {
        const decision = evaluateRecoveryEligibility(createState(ConversationState.Loading));
        const properties = getRecoveryEligibilityTelemetryProperties(decision);

        expect(Object.keys(properties).sort()).toEqual([
            "conversationState",
            "eligible",
            "hasLiveChatContext",
            "hasReconnectId",
            "hasRequestId",
            "reason"
        ]);
        expect(properties).toEqual({
            conversationState: "Loading",
            eligible: true,
            hasLiveChatContext: true,
            hasReconnectId: false,
            hasRequestId: true,
            reason: RecoveryEligibilityReason.LoadingContextPresent
        });
    });
});
