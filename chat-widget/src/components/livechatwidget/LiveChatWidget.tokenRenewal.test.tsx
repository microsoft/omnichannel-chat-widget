import React, { Dispatch, useContext, useEffect } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { ChatContextStore } from "../../contexts/ChatContextStore";
import { ConversationState } from "../../contexts/common/ConversationState";
import { FacadeChatSDK } from "../../common/facades/FacadeChatSDK";
import { FacadeChatSDKStore } from "../../contexts/FacadeChatSDKStore";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetProps } from "./interfaces/ILiveChatWidgetProps";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryConstants, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import { TelemetryManager } from "../../common/telemetry/TelemetryManager";
import { OmnichannelChatSDK } from "@microsoft/omnichannel-chat-sdk";
import { expect, it } from "@jest/globals";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { registerBroadcastServiceForStorage } from "../../common/storage/default/defaultCacheManager";
import { defaultClientDataStoreProvider } from "../../common/storage/default/defaultClientDataStoreProvider";
import { ConversationEndEntity, StorageType } from "../../common/Constants";
import LiveChatWidget from "./LiveChatWidget";

jest.mock("../../common/facades/FacadeChatSDK", () => ({ FacadeChatSDK: jest.fn() }));
jest.mock("@microsoft/omnichannel-chat-sdk", () => ({ OmnichannelChatSDK: jest.fn() }));
jest.mock("@microsoft/omnichannel-chat-components", () => {
    const listeners = new Map<string, Set<(mockMessage: { payload: object }) => void>>();
    return {
        BroadcastService: {
            getMessageByEventName: (name: string) => ({
                subscribe: (listener: (mockMessage: { payload: object }) => void) => {
                    const subscriptions = listeners.get(name) ?? new Set();
                    listeners.set(name, subscriptions);
                    subscriptions.add(listener);
                    return { unsubscribe: () => subscriptions.delete(listener) };
                }
            }),
            postMessage: (msg: { eventName: string; payload: object }) =>
                listeners.get(msg.eventName)?.forEach(listener => listener(msg))
        }
    };
});
jest.mock("../../common/storage/default/defaultClientDataStoreProvider", () => ({
    defaultClientDataStoreProvider: jest.fn()
}));
jest.mock("./common/getMockChatSDKIfApplicable", () => ({
    getMockChatSDKIfApplicable: (sdk: object) => sdk
}));
jest.mock("./common/overridePropsOnMockIfApplicable", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("./common/registerTelemetryLoggers", () => ({ registerTelemetryLoggers: jest.fn() }));
jest.mock("./common/liveChatConfigUtils", () => ({ isPersistentChatEnabled: () => false }));
jest.mock("../../common/utils", () => ({
    isNullOrUndefined: (value: object) => value == null,
    getWidgetCacheIdfromProps: (props: ILiveChatWidgetProps) => props.controlProps?.widgetInstanceId
}));
jest.mock("../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: { logSDKEvent: jest.fn() }
}));
jest.mock("../../contexts/common/LiveChatWidgetContextInitialState", () => {
    const { ConversationEndEntity } = jest.requireActual<typeof import("../../common/Constants")>("../../common/Constants");
    return {
        getLiveChatWidgetContextInitialState: () => ({
            domainStates: {
                liveChatContext: {
                    requestId: "request",
                    sessionId: "session",
                    reconnectId: "reconnect",
                    chatToken: { chatId: "chat", token: "original" }
                },
                chatToken: { chatId: "chat", token: "original" }
            },
            appStates: { conversationState: 5, conversationEndedBy: ConversationEndEntity.NotSet }
        })
    };
});
jest.mock("./livechatwidgetstateful/LiveChatWidgetStateful", () => ({
    __esModule: true,
    default: (props: ILiveChatWidgetProps) => MockProbe(props)
}));

const owners: Record<string, {
    state: ILiveChatWidgetContext;
    dispatch: Dispatch<ILiveChatWidgetAction>;
    replaceFacade: (facade: FacadeChatSDK) => void;
}> = {};
const snapshots: Record<string, ILiveChatWidgetContext> = {};

function MockProbe(props: ILiveChatWidgetProps) {
    const id = props.controlProps?.widgetInstanceId ?? "";
    const [state, dispatch] = useContext<[ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>]>(ChatContextStore);
    const [, replaceFacade] = useContext<[FacadeChatSDK | undefined, (facade: FacadeChatSDK) => void]>(FacadeChatSDKStore);
    owners[id] = { state, dispatch, replaceFacade };
    // Exercise the real owner/reducer; the normal stateful child publishes this same state.
    useEffect(() => {
        snapshots[id] = state;
        BroadcastService.postMessage({ eventName: id, payload: { ...state } });
    }, [id, state]);
    return null;
}

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
    return { promise, resolve, reject };
}

function createOwner(id = "widget", supportsNotifications = true) {
    const listeners = new Set<() => void>();
    let savedListener: () => void = () => undefined;
    const unsubscribe = jest.fn(() => listeners.clear());
    const sdk = Object.assign(new OmnichannelChatSDK({ orgId: "org", orgUrl: "https://org.example", widgetId: id }), {
        requestId: "request",
        sessionId: "session",
        onChatTokenRenewed: supportsNotifications ? jest.fn((listener: () => void) => {
            savedListener = listener;
            listeners.add(listener);
            return unsubscribe;
        }) : undefined
    });
    const context = {
        requestId: "request", sessionId: "session", reconnectId: "reconnect",
        chatToken: { chatId: "chat", token: "renewed" }
    };
    const readContext = jest.fn().mockResolvedValue(context);
    const readToken = jest.fn().mockResolvedValue(context.chatToken);
    const chatConfig = {
        ChatWidgetLanguage: {}, DataMaskingInfo: {}, LiveChatConfigAuthSettings: {},
        LiveChatVersion: 2, LiveWSAndLiveChatEngJoin: {}, allowedFileExtensions: "", maxUploadFileSize: ""
    };
    (FacadeChatSDK as jest.MockedClass<typeof FacadeChatSDK>).mockReset();
    const facade = Object.assign(new FacadeChatSDK({
        chatSDK: sdk, chatConfig, isAuthenticated: false, isSDKMocked: false
    }, false), {
        getChatSDK: () => sdk,
        getCurrentLiveChatContext: readContext,
        getChatToken: readToken
    });
    const props: ILiveChatWidgetProps = {
        chatSDK: sdk, chatConfig, controlProps: { widgetInstanceId: id },
        telemetryConfig: { chatWidgetVersion: "test", chatComponentVersion: "test", OCChatSDKVersion: "test" }
    };
    return {
        props, facade, sdk, context, readContext, readToken, unsubscribe,
        emit: () => listeners.forEach(listener => listener()),
        emitLate: () => savedListener()
    };
}

function mount(owner = createOwner()) {
    (FacadeChatSDK as jest.MockedClass<typeof FacadeChatSDK>).mockImplementation(() => owner.facade);
    return { ...owner, ...render(<LiveChatWidget {...owner.props} />) };
}

async function notify(owner: ReturnType<typeof createOwner>) {
    await act(async () => { owner.emit(); });
}

describe("LiveChatWidget renewed chat state", () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
        Object.keys(owners).forEach(key => delete owners[key]);
        Object.keys(snapshots).forEach(key => delete snapshots[key]);
    });

    it("refreshes both reducer snapshots with the renewed token and preserves reconnect identity", async () => {
        const owner = mount();
        expect(snapshots.widget.appStates.conversationEndedBy).toBe(ConversationEndEntity.NotSet);
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
        expect(owner.readToken).toHaveBeenCalledWith();
        expect(snapshots.widget.domainStates.liveChatContext).toEqual(owner.context);
        expect(snapshots.widget.domainStates.chatToken).toEqual(owner.context.chatToken);
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith(LogLevel.INFO, {
            Event: TelemetryEvent.ChatTokenRenewalStateSynced,
            Description: "dispatched"
        });
        expect(owner.sdk.onChatTokenRenewed).toHaveBeenCalledTimes(1);
        owner.rerender(<LiveChatWidget {...owner.props} />);
        expect(owner.sdk.onChatTokenRenewed).toHaveBeenCalledTimes(1);
    });

    it.each([
        [ConversationState.Active, TelemetryEvent.ChatTokenRenewalStateSynced, "dispatched"],
        [ConversationState.Active, TelemetryEvent.ChatTokenRenewalStateSynced, "republished"],
        [ConversationState.Closed, TelemetryEvent.ChatTokenRenewalStateSyncSkipped, "inactiveSession"],
        [ConversationState.Loading, TelemetryEvent.ChatTokenRenewalStateSyncDeferred, "restoringSession"]
    ] as const)("preserves renewal reasons in SDK telemetry contracts for state %s, event %s, reason %s", async (state, event, reason) => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: state }));
        await notify(owner);
        const [level, payload] = (TelemetryHelper.logSDKEvent as jest.Mock).mock.calls.find(([, data]) => data.Event === event && data.Description === reason) ?? [];
        expect(payload).toBeDefined();
        const { TelemetryHelper: actualHelper } = jest.requireActual<typeof import("../../common/telemetry/TelemetryHelper")>("../../common/telemetry/TelemetryHelper");
        const originalTelemetry = TelemetryManager.InternalTelemetryData;
        try {
            TelemetryManager.InternalTelemetryData = { ...originalTelemetry, OCChatSDKVersion: "test" };
            const contract = actualHelper.buildTelemetryEvent(level, {
                scenarioType: TelemetryConstants.mapEventToScenario(payload.Event),
                payload
            });
            expect(contract).toMatchObject({ Event: event, Description: reason, LogLevel: LogLevel.INFO });
        } finally {
            TelemetryManager.InternalTelemetryData = originalTelemetry;
        }
    });

    it.each([ConversationEndEntity.Customer, ConversationEndEntity.Agent, ConversationEndEntity.Bot])("ignores renewal when the active chat was ended by %s", async (endedBy: ConversationEndEntity) => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: endedBy }));
        await notify(owner);
        expect(owner.readContext).not.toHaveBeenCalled();
        expect(owner.readToken).not.toHaveBeenCalled();
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith(LogLevel.INFO, {
            Event: TelemetryEvent.ChatTokenRenewalStateSyncSkipped,
            Description: "endedOrDisposed"
        });
    });

    it.each([ConversationEndEntity.Customer, ConversationEndEntity.Agent, ConversationEndEntity.Bot])("drops an in-flight renewal when the active chat becomes ended by %s", async (endedBy: ConversationEndEntity) => {
        const owner = mount();
        const pending = deferred<object>();
        owner.readContext.mockReturnValueOnce(pending.promise);
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: endedBy }));
        await act(async () => pending.resolve(owner.context));
        expect(snapshots.widget.domainStates.liveChatContext.chatToken.token).toBe("original");
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
    });

    it("supports older active state without a conversation-ended marker", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: undefined }));
        await notify(owner);
        expect(snapshots.widget.domainStates.liveChatContext).toEqual(owner.context);
        expect(snapshots.widget.domainStates.chatToken).toEqual(owner.context.chatToken);
    });

    it("publishes a renewed persistent-chat token without creating a live context", async () => {
        const setData = jest.fn();
        (defaultClientDataStoreProvider as jest.Mock).mockReturnValue({ setData });
        registerBroadcastServiceForStorage("persistent-token", 30, StorageType.localStorage);
        const owner = mount(createOwner("persistent-token"));
        act(() => {
            owners["persistent-token"].dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
            owners["persistent-token"].dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: { chatId: "chat", requestId: owner.sdk.requestId, token: "original" } });
        });
        setData.mockClear();
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
        expect(owner.readToken).toHaveBeenCalledTimes(1);
        expect(snapshots["persistent-token"].domainStates.chatToken).toEqual(owner.context.chatToken);
        expect(snapshots["persistent-token"].domainStates.liveChatContext).toBeUndefined();
        const [key, serialized] = setData.mock.calls[setData.mock.calls.length - 1];
        const persisted: ILiveChatWidgetContext = JSON.parse(serialized);
        expect(key).toBe("persistent-token");
        expect(persisted.domainStates.chatToken).toEqual(owner.context.chatToken);
        expect(persisted.domainStates.liveChatContext).toBeUndefined();
    });

    it("keeps the newest persistent-chat renewal without introducing a live context", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined }));
        const firstContext = deferred<object>();
        const firstToken = deferred<object>();
        owner.readContext.mockReturnValueOnce(firstContext.promise);
        owner.readToken.mockReturnValueOnce(firstToken.promise);
        await notify(owner);
        await notify(owner);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
        await act(async () => {
            firstContext.resolve({ ...owner.context, chatToken: { chatId: "chat", token: "older" } });
            firstToken.resolve({ chatId: "chat", token: "older" });
        });
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
        expect(snapshots.widget.domainStates.liveChatContext).toBeUndefined();
    });

    it.each(["requestId", "sessionId"] as const)("drops a persistent-chat snapshot when the SDK %s changes during reads", async (key: "requestId" | "sessionId") => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined }));
        const pending = deferred<object>();
        owner.readContext.mockReturnValueOnce(pending.promise);
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
        owner.sdk[key] = "next";
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: { chatId: "chat", token: "next-token" } }));
        await act(async () => pending.resolve(owner.context));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("next-token");
        expect(snapshots.widget.domainStates.liveChatContext).toBeUndefined();
    });

    it.each(["requestId", "sessionId"] as const)("checks the returned persistent-chat %s without a saved context", async (key: "requestId" | "sessionId") => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined }));
        owner.readContext.mockResolvedValue({ ...owner.context, [key]: "other-owner" });
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        expect(snapshots.widget.domainStates.liveChatContext).toBeUndefined();
    });

    it("rejects a persistent-chat token from another chat without a saved context", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined }));
        owner.readToken.mockResolvedValue({ chatId: "other-chat", token: "other-token" });
        await notify(owner);
        expect(owner.readToken).toHaveBeenCalledTimes(1);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        expect(snapshots.widget.domainStates.liveChatContext).toBeUndefined();
    });

    it("rejects a persistent-chat cached token bound to another request before reading", async () => {
        const owner = mount();
        act(() => {
            owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
            owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CHAT_TOKEN, payload: { chatId: "chat", requestId: "other-request", token: "original" } });
        });
        await notify(owner);
        expect(owner.readContext).not.toHaveBeenCalled();
        expect(owner.readToken).not.toHaveBeenCalled();
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
    });

    it("captures a loading persistent-chat renewal on activation without creating a live context", async () => {
        const owner = mount();
        act(() => {
            owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_LIVE_CHAT_CONTEXT, payload: undefined });
            owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading });
        });
        await notify(owner);
        expect(owner.readToken).not.toHaveBeenCalled();
        await act(async () => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active }));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
        expect(snapshots.widget.domainStates.liveChatContext).toBeUndefined();
    });

    it("keeps older SDKs without the optional notification API working", () => {
        const owner = mount(createOwner("legacy", false));
        expect(owner.readContext).not.toHaveBeenCalled();
        expect(snapshots.legacy.domainStates.chatToken.token).toBe("original");
        owner.unmount();
    });

    it("unsubscribes on unmount and ignores an already queued callback", async () => {
        const owner = mount();
        owner.unmount();
        await act(async () => owner.emitLate());
        expect(owner.unsubscribe).toHaveBeenCalledTimes(1);
        expect(owner.readContext).not.toHaveBeenCalled();
    });

    it("releases a replaced facade and drops its pending snapshot", async () => {
        const owner = mount();
        const pending = deferred<object>();
        owner.readContext.mockReturnValueOnce(pending.promise);
        await notify(owner);
        const replacement = createOwner();
        act(() => owners.widget.replaceFacade(replacement.facade));
        expect(owner.unsubscribe).toHaveBeenCalledTimes(1);
        await act(async () => { pending.resolve(owner.context); owner.emitLate(); });
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        await notify(replacement);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
    });

    it.each(["requestId", "sessionId"] as const)("rejects an SDK %s change before or during a read", async (key: "requestId" | "sessionId") => {
        const owner = mount();
        owner.sdk[key] = "next";
        await notify(owner);
        expect(owner.readContext).not.toHaveBeenCalled();
        owner.sdk[key] = key === "requestId" ? "request" : "session";
        const pending = deferred<object>();
        owner.readContext.mockReturnValueOnce(pending.promise);
        await notify(owner);
        owner.sdk[key] = "next";
        await act(async () => pending.resolve(owner.context));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
    });

    it("does not revive an ended chat after async reads complete", async () => {
        const owner = mount();
        const pending = deferred<object>();
        owner.readContext.mockReturnValueOnce(pending.promise);
        await notify(owner);
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed }));
        await act(async () => pending.resolve(owner.context));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
    });

    it("does not overwrite a new chat, even if the request and chat IDs are reused", async () => {
        const owner = mount();
        const pending = deferred<object>();
        owner.readContext.mockReturnValueOnce(pending.promise);
        await notify(owner);
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading }));
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active }));
        await act(async () => pending.resolve(owner.context));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
    });

    it("ignores notifications while loading; post-start capture owns that snapshot", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading }));
        await notify(owner);
        expect(owner.readContext).not.toHaveBeenCalled();
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith(LogLevel.INFO, {
            Event: TelemetryEvent.ChatTokenRenewalStateSyncDeferred,
            Description: "restoringSession"
        });
    });

    it("reports a deferred renewal discarded when the restore ends without an active chat", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading }));
        await notify(owner);
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Closed }));
        expect(owner.readContext).not.toHaveBeenCalled();
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith(LogLevel.INFO, {
            Event: TelemetryEvent.ChatTokenRenewalStateSyncSkipped,
            Description: "inactiveSession"
        });
    });

    it("does not include renewed credential values in synchronization telemetry", async () => {
        const owner = mount();
        owner.context.chatToken.token = "private-renewal-test-value";
        await notify(owner);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("private-renewal-test-value");
        expect(JSON.stringify((TelemetryHelper.logSDKEvent as jest.Mock).mock.calls)).not.toContain("private-renewal-test-value");
    });

    it("captures a renewal during saved-chat restore once that same session becomes active", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading }));
        await notify(owner);
        expect(owner.readContext).not.toHaveBeenCalled();
        await act(async () => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active }));
        expect(snapshots.widget.domainStates.liveChatContext.chatToken.token).toBe("renewed");
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
    });

    it("preserves a completed renewal when saved-chat restore replaces the active snapshot", async () => {
        const owner = mount();
        const cached = snapshots.widget;
        await notify(owner);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
        await act(async () => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_STATE, payload: cached }));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
        expect(snapshots.widget.domainStates.liveChatContext.chatToken.token).toBe("renewed");
        expect(owner.readContext).toHaveBeenCalledTimes(1);
    });

    it("does not restore a completed renewal across a new lifecycle with reused identifiers", async () => {
        const owner = mount();
        const cached = snapshots.widget;
        await notify(owner);
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading }));
        await act(async () => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_WIDGET_STATE, payload: cached }));
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        expect(snapshots.widget.domainStates.liveChatContext.chatToken.token).toBe("original");
    });

    it("republishes a completed renewal after a delayed same-session broadcast overwrites storage", async () => {
        const id = "delayed-cache";
        const setData = jest.fn();
        (defaultClientDataStoreProvider as jest.Mock).mockReturnValue({ setData });
        registerBroadcastServiceForStorage(id, 30, StorageType.localStorage);
        const owner = mount(createOwner(id));
        const cached = snapshots[id];
        await notify(owner);
        await act(async () => BroadcastService.postMessage({ eventName: id, payload: cached }));
        const saved = JSON.parse(setData.mock.calls[setData.mock.calls.length - 1][1]);
        expect(saved.domainStates.chatToken.token).toBe("renewed");
        expect(saved.domainStates.liveChatContext.chatToken.token).toBe("renewed");
        expect(owner.readToken).toHaveBeenCalledTimes(1);
        const syncEvents = (TelemetryHelper.logSDKEvent as jest.Mock).mock.calls
            .filter(([, payload]) => payload.Event === TelemetryEvent.ChatTokenRenewalStateSynced)
            .map(([, payload]) => payload.Description);
        expect(syncEvents.filter(reason => reason === "dispatched")).toHaveLength(1);
        expect(syncEvents).toContain("republished");
    });

    it.each(["no-renewal", "ended", "other-session", "other-widget", "newer-token", "tokenless"])("does not republish a delayed broadcast for %s", async scenario => {
        const id = `delayed-${scenario}`;
        const setData = jest.fn();
        (defaultClientDataStoreProvider as jest.Mock).mockReturnValue({ setData });
        registerBroadcastServiceForStorage(id, 30, StorageType.localStorage);
        const owner = mount(createOwner(id));
        const cached = snapshots[id];
        if (scenario !== "no-renewal") {
            await notify(owner);
        }
        if (scenario === "ended") {
            act(() => owners[id].dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_ENDED_BY, payload: ConversationEndEntity.Customer }));
        }
        let payload = scenario === "other-session" ? {
            ...cached,
            domainStates: { ...cached.domainStates, liveChatContext: { ...cached.domainStates.liveChatContext, sessionId: "other" } }
        } : cached;
        if (scenario === "newer-token") {
            payload = {
                ...cached,
                domainStates: {
                    ...cached.domainStates,
                    chatToken: { ...cached.domainStates.chatToken, token: "other-window-newer" },
                    liveChatContext: { ...cached.domainStates.liveChatContext, chatToken: { ...cached.domainStates.chatToken, token: "other-window-newer" } }
                }
            };
        }
        if (scenario === "tokenless") {
            payload = { ...cached, domainStates: { ...cached.domainStates } };
            delete (payload.domainStates as Partial<ILiveChatWidgetContext["domainStates"]>).chatToken;
        }
        const before = snapshots[id];
        setData.mockClear();
        await act(async () => BroadcastService.postMessage({ eventName: scenario === "other-widget" ? "unrelated" : id, payload }));
        expect(snapshots[id]).toBe(before);
        expect(setData).toHaveBeenCalledTimes(scenario === "other-widget" ? 0 : 1);
    });

    it("does not apply a loading renewal to a different restored session", async () => {
        const owner = mount();
        act(() => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Loading }));
        await notify(owner);
        owner.sdk.sessionId = "different-session";
        await act(async () => owners.widget.dispatch({ type: LiveChatWidgetActionType.SET_CONVERSATION_STATE, payload: ConversationState.Active }));
        expect(owner.readContext).not.toHaveBeenCalled();
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
    });

    it("does not persist results for a different conversation", async () => {
        const owner = mount();
        owner.readToken.mockResolvedValue({ chatId: "other-chat", token: "other-token" });
        await notify(owner);
        expect(owner.readContext).toHaveBeenCalledTimes(1);
        expect(snapshots.widget.domainStates.liveChatContext.chatToken.token).toBe("original");
    });

    it("keeps the newest renewal when same-session reads resolve out of order", async () => {
        const owner = mount();
        const firstContext = deferred<object>();
        const firstToken = deferred<object>();
        owner.readContext.mockReturnValueOnce(firstContext.promise);
        owner.readToken.mockReturnValueOnce(firstToken.promise);
        await notify(owner);
        await notify(owner);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
        await act(async () => {
            firstContext.resolve({ ...owner.context, chatToken: { chatId: "chat", token: "older" } });
            firstToken.resolve({ chatId: "chat", token: "older" });
        });
        expect(snapshots.widget.domainStates.liveChatContext.chatToken.token).toBe("renewed");
        expect(snapshots.widget.domainStates.chatToken.token).toBe("renewed");
    });

    it("keeps independent widgets isolated", async () => {
        const first = mount(createOwner("first"));
        const second = mount(createOwner("second"));
        await notify(first);
        expect(snapshots.first.domainStates.chatToken.token).toBe("renewed");
        expect(snapshots.second.domainStates.chatToken.token).toBe("original");
        expect(second.readContext).not.toHaveBeenCalled();
    });

    it("persists both renewed snapshots through the existing state cache writer", async () => {
        const setData = jest.fn();
        (defaultClientDataStoreProvider as jest.Mock).mockReturnValue({ setData });
        registerBroadcastServiceForStorage("persisted", 30, StorageType.localStorage);
        const owner = mount(createOwner("persisted"));
        setData.mockClear();
        await notify(owner);
        const [key, serialized] = setData.mock.calls[setData.mock.calls.length - 1];
        const persisted: ILiveChatWidgetContext = JSON.parse(serialized);
        expect(key).toBe("persisted");
        expect(persisted.domainStates.liveChatContext).toEqual(owner.context);
        expect(persisted.domainStates.chatToken).toEqual(owner.context.chatToken);
        expect(defaultClientDataStoreProvider).toHaveBeenLastCalledWith(30, StorageType.localStorage);
    });

    it("does not interrupt renewal when the normal storage writer throws", async () => {
        const setData = jest.fn(() => { throw new Error("storage unavailable"); });
        (defaultClientDataStoreProvider as jest.Mock).mockReturnValue({ setData });
        registerBroadcastServiceForStorage("storage-failure", 30, StorageType.localStorage);
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
        try {
            const owner = mount(createOwner("storage-failure"));
            await notify(owner);
            expect(setData).toHaveBeenCalled();
            expect(snapshots["storage-failure"].domainStates.chatToken.token).toBe("renewed");
        } finally {
            consoleError.mockRestore();
        }
    });

    it.each(["context-sync", "context-async", "token-sync", "token-async"])("contains %s read failures without logging secrets", async (failure: string) => {
        const owner = mount();
        const read = failure.startsWith("context") ? owner.readContext : owner.readToken;
        const error = new Error("sensitive-session-key-and-token");
        if (failure.endsWith("sync")) {
            read.mockImplementationOnce(() => { throw error; });
        } else {
            read.mockRejectedValueOnce(error);
        }
        await notify(owner);
        expect(snapshots.widget.domainStates.chatToken.token).toBe("original");
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalled();
        expect(JSON.stringify((TelemetryHelper.logSDKEvent as jest.Mock).mock.calls)).not.toContain(error.message);
    });

    it("contains throwing subscribe/unsubscribe and telemetry listeners", async () => {
        const owner = createOwner();
        owner.unsubscribe.mockImplementation(() => { throw new Error("private unsubscribe error"); });
        (TelemetryHelper.logSDKEvent as jest.Mock).mockImplementation(() => { throw new Error("telemetry"); });
        const mounted = mount(owner);
        expect(() => mounted.unmount()).not.toThrow();
        const failing = createOwner();
        failing.sdk.onChatTokenRenewed?.mockImplementation(() => { throw new Error("private subscribe error"); });
        expect(() => mount(failing)).not.toThrow();
    });
});
