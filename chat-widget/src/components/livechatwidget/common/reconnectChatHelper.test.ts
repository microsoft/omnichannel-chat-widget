/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConversationMode } from "../../../common/Constants";
import { ConversationState } from "../../../contexts/common/ConversationState";
import { executeReducer } from "../../../contexts/createReducer";
import { isReconnectTriggered } from "./reconnectChatHelper";

jest.mock("../../../contexts/createReducer", () => ({
    executeReducer: jest.fn()
}));

jest.mock("../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logSDKEvent: jest.fn()
    }
}));

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

// `common/utils` and the error handler are mocked so this suite does not load @microsoft/omnichannel-chat-sdk.
jest.mock("../../../common/utils", () => ({
    checkContactIdError: jest.fn(),
    isNullOrEmptyString: jest.fn((value: any) => value === null || value === undefined || value === ""),
    isNullOrUndefined: jest.fn((value: any) => value === null || value === undefined)
}));

jest.mock("./startChatErrorHandler", () => ({
    handleStartChatError: jest.fn()
}));

jest.mock("./authHelper", () => ({
    removeAuthTokenProvider: jest.fn()
}));

const mockExecuteReducer = executeReducer as jest.MockedFunction<typeof executeReducer>;

const inMemoryStateWith = (conversationState: ConversationState) => ({ appStates: { conversationState } }) as any;

describe("isReconnectTriggered", () => {
    let mockFacadeChatSDK: any;
    let mockDispatch: jest.Mock;
    let mockSetAdapter: jest.Mock;
    let mockInitStartChat: jest.Mock;
    let state: any;
    let props: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockFacadeChatSDK = {
            getChatReconnectContext: jest.fn().mockResolvedValue({ reconnectId: "reconnect-id" }),
            getChatSDK: jest.fn(() => ({}))
        };
        mockDispatch = jest.fn();
        mockSetAdapter = jest.fn();
        mockInitStartChat = jest.fn().mockResolvedValue(true);
        state = { appStates: { conversationState: ConversationState.Loading } };
        props = {
            chatConfig: { LiveWSAndLiveChatEngJoin: { msdyn_enablechatreconnect: "true", msdyn_conversationmode: ConversationMode.Regular } },
            controlProps: { hideReconnectChatPane: true }
        };
        // initStartChat resolves before React renders Active, so the in-memory state still reads Loading.
        mockExecuteReducer.mockReturnValue(inMemoryStateWith(ConversationState.Loading));
    });

    // Otherwise the caller (LiveChatWidgetStateful startChat) starts a second conversation for the same customer.
    it("should report the reconnect as handled when it started the chat, even before React renders Active", async () => {
        const triggered = await isReconnectTriggered(mockFacadeChatSDK, props, mockDispatch, mockSetAdapter, mockInitStartChat, state);

        expect(mockInitStartChat).toHaveBeenCalledTimes(1);
        expect(mockInitStartChat).toHaveBeenCalledWith(mockFacadeChatSDK, mockDispatch, mockSetAdapter, state, props, { reconnectId: "reconnect-id" });
        expect(triggered).toBe(true);
    });

    it("should not report the reconnect as handled when its start chat failed, so the caller can start the chat", async () => {
        mockInitStartChat.mockResolvedValue(false);

        const triggered = await isReconnectTriggered(mockFacadeChatSDK, props, mockDispatch, mockSetAdapter, mockInitStartChat, state);

        expect(mockInitStartChat).toHaveBeenCalledTimes(1);
        expect(triggered).toBe(false);
    });

    it("should report the reconnect as handled when it showed the reconnect pane", async () => {
        props.controlProps = {};
        mockExecuteReducer.mockReturnValue(inMemoryStateWith(ConversationState.ReconnectChat));

        const triggered = await isReconnectTriggered(mockFacadeChatSDK, props, mockDispatch, mockSetAdapter, mockInitStartChat, state);

        expect(mockInitStartChat).not.toHaveBeenCalled();
        expect(triggered).toBe(true);
    });

    it("should not report the reconnect as handled when there is no reconnect id", async () => {
        mockFacadeChatSDK.getChatReconnectContext.mockResolvedValue({});

        const triggered = await isReconnectTriggered(mockFacadeChatSDK, props, mockDispatch, mockSetAdapter, mockInitStartChat, state);

        expect(mockInitStartChat).not.toHaveBeenCalled();
        expect(triggered).toBe(false);
    });

    it("should not try to reconnect when reconnect is disabled", async () => {
        props.chatConfig.LiveWSAndLiveChatEngJoin.msdyn_enablechatreconnect = "false";

        const triggered = await isReconnectTriggered(mockFacadeChatSDK, props, mockDispatch, mockSetAdapter, mockInitStartChat, state);

        expect(mockFacadeChatSDK.getChatReconnectContext).not.toHaveBeenCalled();
        expect(triggered).toBe(false);
    });
});
