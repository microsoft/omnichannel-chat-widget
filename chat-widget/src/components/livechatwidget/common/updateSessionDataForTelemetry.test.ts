/* eslint-disable @typescript-eslint/no-explicit-any */

import { BroadcastEvent, LogLevel, TelemetryEvent } from "../../../common/telemetry/TelemetryConstants";
import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import { TelemetryHelper } from "../../../common/telemetry/TelemetryHelper";
import { getConversationDetailsCall } from "../../../common/utils";
import { updateTelemetryData } from "./updateSessionDataForTelemetry";

jest.mock("../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logSDKEvent: jest.fn(),
        addSessionDataToTelemetry: jest.fn(() => ({ source: "session" })),
        addConversationDataToTelemetry: jest.fn(() => ({ source: "conversation" }))
    }
}));

jest.mock("../../../common/telemetry/TelemetryManager", () => ({
    TelemetryManager: { InternalTelemetryData: {} }
}));

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: {
        postMessage: jest.fn()
    }
}));

jest.mock("../../../common/utils", () => ({
    getConversationDetailsCall: jest.fn()
}));

const mockGetConversationDetailsCall = getConversationDetailsCall as jest.MockedFunction<typeof getConversationDetailsCall>;
const mockLogSDKEvent = TelemetryHelper.logSDKEvent as jest.Mock;
const mockPostMessage = BroadcastService.postMessage as jest.Mock;

describe("updateTelemetryData", () => {
    let mockFacadeChatSDK: any;
    let mockDispatch: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockDispatch = jest.fn();
        mockFacadeChatSDK = {
            getChatSDK: jest.fn(() => ({})),
            getCurrentLiveChatContext: jest.fn().mockResolvedValue({ requestId: "request-id" })
        };
        mockGetConversationDetailsCall.mockResolvedValue({ conversationId: "conversation-id" });
    });

    it("should add session and conversation data to telemetry", async () => {
        await updateTelemetryData(mockFacadeChatSDK, mockDispatch);

        expect(mockDispatch).toHaveBeenCalledWith({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: { source: "session" } });
        expect(mockDispatch).toHaveBeenCalledWith({ type: LiveChatWidgetActionType.SET_TELEMETRY_DATA, payload: { source: "conversation" } });
        expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({ eventName: BroadcastEvent.UpdateSessionDataForTelemetry }));
        expect(mockPostMessage).toHaveBeenCalledWith(expect.objectContaining({ eventName: BroadcastEvent.UpdateConversationDataForTelemetry }));
        expect(mockLogSDKEvent).not.toHaveBeenCalled();
    });

    // A late result from the previous chat must not overwrite the next chat's conversationId: it feeds message
    // telemetry and, through the broadcast, the post-chat survey correlation id.
    it("should drop results that resolve after the next chat has started", async () => {
        const chatSDK = { requestId: "chat-1-request-id" };
        mockFacadeChatSDK.getChatSDK = jest.fn(() => chatSDK);
        let resolveSession: (value: any) => void = () => undefined;
        let resolveConversation: (value: any) => void = () => undefined;
        mockFacadeChatSDK.getCurrentLiveChatContext = jest.fn(() => new Promise((resolve) => { resolveSession = resolve; }));
        mockGetConversationDetailsCall.mockReturnValue(new Promise((resolve) => { resolveConversation = resolve; }));

        const pending = updateTelemetryData(mockFacadeChatSDK, mockDispatch);

        // chatSDKStateCleanUp assigns a new requestId when the next chat starts.
        chatSDK.requestId = "chat-2-request-id";
        resolveSession({ requestId: "chat-1-request-id" });
        resolveConversation({ conversationId: "chat-1-conversation-id" });
        await pending;

        expect(TelemetryHelper.addSessionDataToTelemetry).not.toHaveBeenCalled();
        expect(TelemetryHelper.addConversationDataToTelemetry).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockPostMessage).not.toHaveBeenCalled();
    });

    // startChat runs this in the background after the chat is Active. A telemetry failure must be
    // logged, not rejected: there is no caller left to handle it, and it must never end the chat.
    it("should log and not reject when updating telemetry data fails", async () => {
        mockFacadeChatSDK.getCurrentLiveChatContext.mockRejectedValue(new Error("live chat context failed"));

        await expect(updateTelemetryData(mockFacadeChatSDK, mockDispatch)).resolves.toBeUndefined();

        expect(mockLogSDKEvent).toHaveBeenCalledWith(LogLevel.ERROR, expect.objectContaining({
            Event: TelemetryEvent.UpdateTelemetryDataFailed,
            ExceptionDetails: { exception: expect.stringContaining("live chat context failed") }
        }));
    });
});
