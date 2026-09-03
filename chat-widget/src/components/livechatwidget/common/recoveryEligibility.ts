import StartChatOptionalParams from "@microsoft/omnichannel-chat-sdk/lib/core/StartChatOptionalParams";

import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";

export enum RecoveryEligibilityReason {
    ReconnectIdPresent = "ReconnectIdPresent",
    ActiveContextPresent = "ActiveContextPresent",
    LoadingContextPresent = "LoadingContextPresent",
    MissingContext = "MissingContext",
    MissingRequestId = "MissingRequestId",
    UnsupportedState = "UnsupportedState"
}

export interface RecoveryEligibilityDecision {
    eligible: boolean;
    optionalParams: StartChatOptionalParams;
    conversationState: string;
    hasReconnectId: boolean;
    hasLiveChatContext: boolean;
    hasRequestId: boolean;
    reason: RecoveryEligibilityReason;
}

export interface RecoveryEligibilityTelemetryProperties {
    conversationState: string;
    hasReconnectId: boolean;
    hasLiveChatContext: boolean;
    hasRequestId: boolean;
    eligible: boolean;
    reason: RecoveryEligibilityReason;
}

const hasNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;

const getConversationStateName = (conversationState: unknown): string => {
    if (typeof conversationState !== "number") {
        return "Unknown";
    }

    const stateName = ConversationState[conversationState];
    return typeof stateName === "string" ? stateName : "Unknown";
};

export const evaluateRecoveryEligibility = (state: ILiveChatWidgetContext): RecoveryEligibilityDecision => {
    const reconnectId = state.appStates?.reconnectId;
    const liveChatContext = state.domainStates?.liveChatContext;
    const conversationState = state.appStates?.conversationState;
    const hasReconnectId = hasNonEmptyString(reconnectId);
    const hasLiveChatContext = liveChatContext !== null && typeof liveChatContext === "object";
    const hasRequestId = hasLiveChatContext && hasNonEmptyString(liveChatContext.requestId);
    const conversationStateName = getConversationStateName(conversationState);

    if (hasReconnectId) {
        return {
            eligible: true,
            optionalParams: { reconnectId },
            conversationState: conversationStateName,
            hasReconnectId,
            hasLiveChatContext,
            hasRequestId,
            reason: RecoveryEligibilityReason.ReconnectIdPresent
        };
    }

    if (!hasLiveChatContext) {
        return {
            eligible: false,
            optionalParams: {},
            conversationState: conversationStateName,
            hasReconnectId,
            hasLiveChatContext,
            hasRequestId,
            reason: RecoveryEligibilityReason.MissingContext
        };
    }

    if (!hasRequestId) {
        return {
            eligible: false,
            optionalParams: {},
            conversationState: conversationStateName,
            hasReconnectId,
            hasLiveChatContext,
            hasRequestId,
            reason: RecoveryEligibilityReason.MissingRequestId
        };
    }

    if (conversationState === ConversationState.Active) {
        return {
            eligible: true,
            optionalParams: { liveChatContext },
            conversationState: conversationStateName,
            hasReconnectId,
            hasLiveChatContext,
            hasRequestId,
            reason: RecoveryEligibilityReason.ActiveContextPresent
        };
    }

    if (conversationState === ConversationState.Loading) {
        return {
            eligible: true,
            optionalParams: { liveChatContext },
            conversationState: conversationStateName,
            hasReconnectId,
            hasLiveChatContext,
            hasRequestId,
            reason: RecoveryEligibilityReason.LoadingContextPresent
        };
    }

    return {
        eligible: false,
        optionalParams: {},
        conversationState: conversationStateName,
        hasReconnectId,
        hasLiveChatContext,
        hasRequestId,
        reason: RecoveryEligibilityReason.UnsupportedState
    };
};

export const getRecoveryEligibilityTelemetryProperties = (
    decision: RecoveryEligibilityDecision
): RecoveryEligibilityTelemetryProperties => ({
    conversationState: decision.conversationState,
    hasReconnectId: decision.hasReconnectId,
    hasLiveChatContext: decision.hasLiveChatContext,
    hasRequestId: decision.hasRequestId,
    eligible: decision.eligible,
    reason: decision.reason
});
