import React, { Dispatch, useEffect, useReducer } from "react";
import { act } from "@testing-library/react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { ConversationEndEntity, StorageType } from "../../../common/Constants";
import { FacadeChatSDK } from "../../../common/facades/FacadeChatSDK";
import { LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { defaultClientDataStoreProvider } from "../../../common/storage/default/defaultClientDataStoreProvider";
import { registerBroadcastServiceForStorage } from "../../../common/storage/default/defaultCacheManager";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { ILiveChatWidgetAction } from "../../../contexts/common/ILiveChatWidgetAction";
import { ILiveChatWidgetContext } from "../../../contexts/common/ILiveChatWidgetContext";
import { createReducer } from "../../../contexts/createReducer";
import { initStartChat } from "./startChat";
import { useChatTokenRenewal } from "./useChatTokenRenewal";

jest.mock("@microsoft/omnichannel-chat-components", () => {
    const listeners = new Map<string, Set<(message: { payload: object }) => void>>();
    return {
        BroadcastService: {
            getMessageByEventName: (name: string) => ({
                subscribe: (listener: (message: { payload: object }) => void) => {
                    const subscriptions = listeners.get(name) ?? new Set();
                    listeners.set(name, subscriptions);
                    subscriptions.add(listener);
                    return { unsubscribe: () => subscriptions.delete(listener) };
                }
            }),
            postMessage: (message: { eventName: string; payload: object }) =>
                listeners.get(message.eventName)?.forEach(listener => listener(message))
        }
    };
});
jest.mock("../../../common/storage/default/defaultClientDataStoreProvider", () => ({
    defaultClientDataStoreProvider: jest.fn()
}));
jest.mock("../../../common/telemetry/TelemetryHelper");
jest.mock("./createAdapter", () => ({ createAdapter: jest.fn().mockResolvedValue({}) }));
jest.mock("./ActivityStreamHandler", () => ({ ActivityStreamHandler: { uncork: jest.fn() } }));
jest.mock("../../../plugins/newMessageEventHandler");
jest.mock("../../../firstresponselatency/FirstMessageTrackerFromBot");
jest.mock("./setPostChatContextAndLoadSurvey");
jest.mock("./updateSessionDataForTelemetry");
jest.mock("./startChatErrorHandler", () => ({
    handleStartChatError: jest.fn(),
    logStartChatComplete: jest.fn(),
    logWidgetLoadComplete: jest.fn()
}));

describe("saved-chat start with a renewal notification", () => {
    let root: ReturnType<typeof createRoot>;
    let container: HTMLDivElement;
    const actEnvironment = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
    let previousActEnvironment: boolean | undefined;

    beforeEach(() => {
        previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
        actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    });
    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
        jest.clearAllMocks();
    });

    it.each([false, true])("persists the renewed context after the real restore sequence (separate renders: %s)", async separateRenders => {
        const id = `restore-${separateRenders}`;
        const renewedToken = { chatId: "chat", requestId: "request", token: "renewed" };
        const context = { requestId: "request", sessionId: "session", chatToken: renewedToken };
        const saved = {
            appStates: { conversationState: ConversationState.Active, conversationEndedBy: ConversationEndEntity.NotSet },
            domainStates: {
                customContext: { source: "restore-test" },
                liveChatContext: { ...context, chatToken: { ...renewedToken, token: "old" } },
                chatToken: { ...renewedToken, token: "old" }
            }
        } as unknown as ILiveChatWidgetContext;
        const initial = {
            ...saved,
            appStates: { ...saved.appStates, conversationState: ConversationState.Loading },
            domainStates: {
                ...saved.domainStates,
                liveChatContext: undefined,
                chatToken: { chatId: "chat", token: "old" }
            }
        } as unknown as ILiveChatWidgetContext;
        let notify: (() => void) | undefined;
        const sdk = {
            requestId: "request",
            sessionId: "session",
            onChatTokenRenewed: (listener: () => void) => {
                notify = listener;
                return () => { notify = undefined; };
            }
        };
        const facade = {
            getChatSDK: () => sdk,
            startChat: jest.fn(async () => { notify?.(); }),
            getChatToken: jest.fn().mockResolvedValue(renewedToken),
            getCurrentLiveChatContext: jest.fn().mockResolvedValue(context)
        } as unknown as FacadeChatSDK;
        const setData = jest.fn();
        (defaultClientDataStoreProvider as jest.Mock).mockReturnValue({ setData });
        registerBroadcastServiceForStorage(id, 30, StorageType.localStorage);
        let latest = initial;
        let startDispatch!: Dispatch<ILiveChatWidgetAction>;
        function Probe() {
            const [state, dispatch] = useReducer(createReducer(), initial);
            latest = state;
            startDispatch = separateRenders ? action => flushSync(() => dispatch(action)) : dispatch;
            useChatTokenRenewal(facade, state, dispatch, id);
            useEffect(() => {
                BroadcastService.postMessage({ eventName: id, payload: state });
            }, [state]);
            return null;
        }
        container = document.createElement("div");
        document.body.appendChild(container);
        root = createRoot(container);
        act(() => root.render(<Probe />));
        let restored: boolean | undefined;
        await act(async () => {
            restored = await initStartChat(facade, startDispatch, jest.fn(), initial, undefined,
                { liveChatContext: saved.domainStates.liveChatContext }, saved);
        });
        expect(restored).toBe(true);
        expect(facade.startChat).toHaveBeenCalledWith(expect.objectContaining({
            liveChatContext: saved.domainStates.liveChatContext
        }));
        expect(latest.appStates.conversationState).toBe(ConversationState.Active);
        expect(latest.domainStates.chatToken).toEqual(renewedToken);
        expect(latest.domainStates.liveChatContext).toEqual(context);
        const [key, serialized] = setData.mock.calls[setData.mock.calls.length - 1];
        const persisted: ILiveChatWidgetContext = JSON.parse(serialized);
        expect(key).toBe(id);
        expect(persisted.domainStates.chatToken).toEqual(renewedToken);
        expect(persisted.domainStates.liveChatContext).toEqual(context);
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith(LogLevel.INFO, {
            Event: TelemetryEvent.ChatTokenRenewalStateSyncDeferred,
            Description: "restoringSession"
        });
        expect(TelemetryHelper.logSDKEvent).toHaveBeenCalledWith(LogLevel.INFO, {
            Event: TelemetryEvent.ChatTokenRenewalStateSynced,
            Description: "dispatched"
        });
    });
});
