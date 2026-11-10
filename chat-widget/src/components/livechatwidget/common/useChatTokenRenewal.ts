import { Dispatch, useEffect, useRef } from "react";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { ConversationEndEntity } from "../../../common/Constants";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import LiveChatContext from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatContext";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";

const logSyncFailure = (description: string) => {
    try {
        TelemetryHelper.logSDKEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.ChatTokenRenewalStateSyncFailed,
            Description: description
        });
    } catch {
        // A telemetry listener must not interrupt token recovery or teardown.
    }
};

const logSyncInfo = (event: TelemetryEvent, reason: string) => {
    try {
        TelemetryHelper.logSDKEvent(LogLevel.INFO, {
            Event: event,
            Description: reason
        });
    } catch {
        // Telemetry must not interrupt credential synchronization.
    }
};

export const useChatTokenRenewal = (facade: FacadeChatSDK | undefined, state: ILiveChatWidgetContext, dispatch: Dispatch<ILiveChatWidgetAction>, widgetCacheId: string) => {
    const current = useRef({ facade, state, generation: 0, lifecycle: 0 });
    const pending = useRef<(() => void) | undefined>();
    const reconcile = useRef<((snapshot?: ILiveChatWidgetContext) => void) | undefined>();
    const supersededTokens = useRef(new Set<string>());
    const previous = current.current;
    let generation = previous.generation;
    const lifecycleChanged = previous.facade !== facade ||
        previous.state.appStates.conversationState !== state.appStates.conversationState ||
        previous.state.appStates.conversationEndedBy !== state.appStates.conversationEndedBy;
    if (lifecycleChanged ||
        previous.state.domainStates.liveChatContext?.requestId !== state.domainStates.liveChatContext?.requestId ||
        previous.state.domainStates.liveChatContext?.sessionId !== state.domainStates.liveChatContext?.sessionId ||
        previous.state.domainStates.chatToken?.requestId !== state.domainStates.chatToken?.requestId ||
        previous.state.domainStates.chatToken?.chatId !== state.domainStates.chatToken?.chatId) {
        generation++;
    }
    current.current = { facade, state, generation, lifecycle: previous.lifecycle + (lifecycleChanged ? 1 : 0) };

    useEffect(() => {
        if (!facade) {
            return;
        }
        let disposed = false;
        let revision = 0;
        let unsubscribe: (() => void) | undefined;
        let stateSubscription: { unsubscribe: () => void } | undefined;
        const refresh = async () => {
            const renewal = ++revision;
            const owner = current.current;
            try {
                const endedBy = owner.state.appStates.conversationEndedBy;
                if (disposed || owner.facade !== facade ||
                    (endedBy !== undefined && endedBy !== ConversationEndEntity.NotSet)) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "endedOrDisposed");
                    return;
                }
                const sdk = facade.getChatSDK();
                const requestId = sdk.requestId;
                const sessionId = sdk.sessionId;
                if (owner.state.appStates.conversationState === ConversationState.Loading) {
                    // A saved-state restore can replace post-start state with the old snapshot.
                    // Defer this notification until that same loading session becomes active.
                    if (pending.current) {
                        logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "supersededDeferredRenewal");
                    }
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncDeferred, "restoringSession");
                    pending.current = async () => {
                        // Let Active and the subsequent saved snapshot finish dispatching first.
                        await Promise.resolve();
                        try {
                            if (!disposed && renewal === revision && current.current.facade === facade &&
                                current.current.lifecycle === owner.lifecycle + 1 &&
                                facade.getChatSDK() === sdk && sdk.requestId === requestId && sdk.sessionId === sessionId) {
                                await refresh();
                            } else {
                                logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "deferredSessionChanged");
                            }
                        } catch {
                            logSyncFailure("Unable to synchronize deferred renewed chat state");
                        }
                    };
                    return;
                }
                if (owner.state.appStates.conversationState !== ConversationState.Active) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "inactiveSession");
                    return;
                }
                const savedContext = owner.state.domainStates.liveChatContext;
                const savedToken = owner.state.domainStates.chatToken;
                const previousToken = savedToken?.token;
                const previousContextToken = savedContext?.chatToken?.token;
                const chatId = savedToken?.chatId;
                if (!requestId || !chatId ||
                    (savedToken.requestId && savedToken.requestId !== requestId) ||
                    (savedContext && (savedContext.requestId !== requestId ||
                        (savedContext.sessionId && savedContext.sessionId !== sessionId)))) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "savedSessionMismatch");
                    return;
                }
                const isCurrent = () => !disposed && renewal === revision &&
                    current.current.facade === facade && current.current.generation === owner.generation &&
                    facade.getChatSDK() === sdk && sdk.requestId === requestId && sdk.sessionId === sessionId;
                if (!isCurrent()) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "supersededOrSessionChanged");
                    return;
                }
                const [context, chatToken] = await Promise.all([
                    facade.getCurrentLiveChatContext(),
                    facade.getChatToken()
                ]);
                if (!isCurrent()) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "supersededOrSessionChanged");
                    return;
                }
                const liveChatContext = context as LiveChatContext;
                if (liveChatContext?.requestId !== requestId ||
                    (liveChatContext.sessionId && liveChatContext.sessionId !== sessionId) ||
                    chatToken?.chatId !== chatId || liveChatContext.chatToken?.chatId !== chatId ||
                    liveChatContext.chatToken?.token !== chatToken.token) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "renewedSessionMismatch");
                    return;
                }
                // The normal state publisher/cache writer owns persistence, scope and TTL.
                // Persistent chat keeps using reconnectId instead of creating a live context.
                // A late saved-state restore must not replace this same session's renewal.
                if (previousToken) {
                    supersededTokens.current.add(previousToken);
                }
                if (previousContextToken) {
                    supersededTokens.current.add(previousContextToken);
                }
                reconcile.current = (snapshot?: ILiveChatWidgetContext) => {
                    if (!isCurrent()) {
                        return;
                    }
                    if (snapshot && (snapshot.appStates?.conversationState !== ConversationState.Active ||
                        (snapshot.appStates.conversationEndedBy !== undefined &&
                            snapshot.appStates.conversationEndedBy !== ConversationEndEntity.NotSet) ||
                        snapshot.domainStates?.chatToken?.chatId !== chatId ||
                        (snapshot.domainStates.chatToken.requestId && snapshot.domainStates.chatToken.requestId !== requestId) ||
                        (snapshot.domainStates.liveChatContext &&
                            (snapshot.domainStates.liveChatContext.requestId !== requestId ||
                                (snapshot.domainStates.liveChatContext.sessionId &&
                                    snapshot.domainStates.liveChatContext.sessionId !== sessionId))))) {
                        return;
                    }
                    // Another window may publish a newer credential we have never replaced.
                    if (snapshot && (
                        (snapshot.domainStates.chatToken.token !== chatToken.token &&
                            !supersededTokens.current.has(snapshot.domainStates.chatToken.token)) ||
                        (snapshot.domainStates.liveChatContext &&
                            snapshot.domainStates.liveChatContext.chatToken?.token !== chatToken.token &&
                            !supersededTokens.current.has(snapshot.domainStates.liveChatContext.chatToken?.token)))) {
                        return;
                    }
                    const latest = (snapshot ?? current.current.state).domainStates;
                    if (savedContext && latest.liveChatContext?.chatToken?.token !== chatToken.token) {
                        dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: liveChatContext });
                    }
                    if (latest.chatToken?.token !== chatToken.token) {
                        dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: chatToken });
                        logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSynced, "republished");
                    }
                };
                if (savedContext) {
                    dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: liveChatContext });
                }
                dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: chatToken });
                logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSynced, "dispatched");
            } catch {
                logSyncFailure("Unable to synchronize renewed chat state");
            }
        };
        try {
            const sdk = facade.getChatSDK();
            unsubscribe = sdk.onChatTokenRenewed?.(() => { void refresh(); });
        } catch {
            logSyncFailure("Unable to subscribe to chat token renewal");
        }
        try {
            // Delayed broadcast retries can overwrite storage after React state is current.
            stateSubscription = BroadcastService.getMessageByEventName(widgetCacheId)
                .subscribe(message => reconcile.current?.(message.payload));
        } catch {
            logSyncFailure("Unable to subscribe to renewed chat state publication");
        }
        return () => {
            disposed = true;
            revision++;
            if (pending.current) {
                logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "subscriptionDisposed");
            }
            pending.current = undefined;
            reconcile.current = undefined;
            supersededTokens.current.clear();
            try {
                unsubscribe?.();
            } catch {
                logSyncFailure("Unable to unsubscribe from chat token renewal");
            }
            try {
                stateSubscription?.unsubscribe();
            } catch {
                logSyncFailure("Unable to unsubscribe from renewed chat state publication");
            }
        };
    }, [facade, dispatch, widgetCacheId]);

    useEffect(() => {
        if (state.appStates.conversationState === ConversationState.Active) {
            const refresh = pending.current;
            pending.current = undefined;
            try {
                refresh?.();
                reconcile.current?.();
            } catch {
                logSyncFailure("Unable to synchronize renewed chat state");
            }
        } else {
            reconcile.current = undefined;
            supersededTokens.current.clear();
            if (state.appStates.conversationState !== ConversationState.Loading) {
                if (pending.current) {
                    logSyncInfo(TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "inactiveSession");
                }
                pending.current = undefined;
            }
        }
    }, [facade, state.appStates.conversationState, state.domainStates.chatToken?.token, state.domainStates.liveChatContext?.chatToken?.token]);
};
