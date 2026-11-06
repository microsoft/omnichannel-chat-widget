import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { isUndefinedOrEmpty } from "../../../common/utils";

export enum RecoveryEligibilityReason {
    ReconnectIdPresent = "ReconnectIdPresent",
    ActiveContextPresent = "ActiveContextPresent",
    MissingContext = "MissingContext",
    CachedContextNonActive = "CachedContextNonActive"
}

export interface RecoveryEligibilityTelemetryProperties {
    conversationState: string;
    hasReconnectId: boolean;
    hasLiveChatContext: boolean;
    hasRequestId: boolean;
    eligible: boolean;
    reason: RecoveryEligibilityReason;
}

interface RecoveryEligibilityScalarTelemetryProperties {
    conversationState: string;
    hasReconnectId: string;
    hasLiveChatContext: string;
    hasRequestId: string;
    eligible: string;
    reason: RecoveryEligibilityReason;
}

const getConversationStateName = (conversationState: unknown): string => {
    if (typeof conversationState !== "number") {
        return "Unknown";
    }

    const stateName = ConversationState[conversationState];
    return typeof stateName === "string" ? stateName : "Unknown";
};

export const getRecoveryEligibilityTelemetryProperties = (
    state: ILiveChatWidgetContext,
    eligible: boolean
): RecoveryEligibilityTelemetryProperties => {
    const reconnectId = state.appStates?.reconnectId;
    const liveChatContext = state.domainStates?.liveChatContext;
    const hasReconnectId = !isUndefinedOrEmpty(reconnectId);
    const hasLiveChatContext = !isUndefinedOrEmpty(liveChatContext);
    const hasRequestId = !isUndefinedOrEmpty(liveChatContext?.requestId);

    let reason = RecoveryEligibilityReason.ActiveContextPresent;
    if (hasReconnectId) {
        reason = RecoveryEligibilityReason.ReconnectIdPresent;
    } else if (!hasLiveChatContext) {
        reason = RecoveryEligibilityReason.MissingContext;
    } else if (state.appStates?.conversationState !== ConversationState.Active) {
        reason = RecoveryEligibilityReason.CachedContextNonActive;
    }

    return {
        conversationState: getConversationStateName(state.appStates?.conversationState),
        hasReconnectId,
        hasLiveChatContext,
        hasRequestId,
        eligible,
        reason
    };
};

const getRecoveryEligibilityScalarTelemetryProperties = (
    properties: RecoveryEligibilityTelemetryProperties
): RecoveryEligibilityScalarTelemetryProperties => ({
    conversationState: properties.conversationState,
    hasReconnectId: String(properties.hasReconnectId),
    hasLiveChatContext: String(properties.hasLiveChatContext),
    hasRequestId: String(properties.hasRequestId),
    eligible: String(properties.eligible),
    reason: properties.reason
});

export const logRecoveryEligibilityTelemetry = (
    state: ILiveChatWidgetContext,
    eligible: boolean
): void => {
    try {
        const properties = getRecoveryEligibilityTelemetryProperties(state, eligible);
        TelemetryHelper.logActionEvent(LogLevel.INFO, {
            Event: TelemetryEvent.RecoveryEligibilityEvaluated,
            CustomProperties: properties,
            ...getRecoveryEligibilityScalarTelemetryProperties(properties)
        });
    } catch (error) {
        console.warn(error);
    }
};
