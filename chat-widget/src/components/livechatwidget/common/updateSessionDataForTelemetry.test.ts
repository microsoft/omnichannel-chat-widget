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
