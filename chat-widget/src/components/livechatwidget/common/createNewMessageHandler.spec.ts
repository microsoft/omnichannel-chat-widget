import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../common/telemetry/TelemetryConstants";
import LiveChatVersion from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatVersion";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import type OmnichannelMessage from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";
import { PersonType } from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";
import { createNewMessageHandler } from "./createNewMessageHandler";

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: { postMessage: jest.fn() }
}));

const createMessage = (role?: string, content = "TEST ONLY"): OmnichannelMessage => ({
    id: "test-message",
    liveChatVersion: LiveChatVersion.V2,
    content,
    contentType: "Text",
    deliveryMode: undefined,
    messageType: "UserMessage",
    sender: { id: "test-sender", displayName: "Test", type: PersonType.User },
    timestamp: new Date("2026-01-01T00:00:00Z"),
    role
});

describe("createNewMessageHandler", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe.each([-1, 4])("with message counter %i", initialCount => {
        it.each([
            ["ordinary edit", "TEST ONLY edited"],
            ["masked text", "********"],
            ["empty masked text", ""]
        ])("does not notify for a customer %s", (_scenario, content) => {
            const counter = { current: initialCount };
            const dispatch = jest.fn();
            const handler = createNewMessageHandler(counter, dispatch);

            handler(createMessage("user", content));

            expect(counter.current).toBe(initialCount);
            expect(dispatch).not.toHaveBeenCalled();
            expect(BroadcastService.postMessage).not.toHaveBeenCalled();
        });
    });

    it.each(["agent", "bot", "system", "channel", "unknown", undefined])(
        "preserves notification behavior for role %s",
        role => {
            const counter = { current: -1 };
            const dispatch = jest.fn();
            const handler = createNewMessageHandler(counter, dispatch);

            handler(createMessage(role));

            expect(counter.current).toBe(0);
            expect(dispatch).toHaveBeenCalledTimes(1);
            expect(dispatch).toHaveBeenCalledWith({
                type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
                payload: 1
            });
            expect(BroadcastService.postMessage).toHaveBeenCalledTimes(1);
            expect(BroadcastService.postMessage).toHaveBeenCalledWith({
                eventName: BroadcastEvent.NewMessageNotification
            });
        }
    );

    it("counts incoming callbacks but not interleaved customer updates", () => {
        const counter = { current: -1 };
        const dispatch = jest.fn();
        const handler = createNewMessageHandler(counter, dispatch);

        handler(createMessage("user", "TEST ONLY edited"));
        handler(createMessage("agent"));
        handler(createMessage("user", ""));
        handler(createMessage("agent", ""));

        expect(counter.current).toBe(1);
        expect(dispatch).toHaveBeenCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
            type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
            payload: 1
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
            payload: 2
        });
        expect(BroadcastService.postMessage).toHaveBeenCalledTimes(2);
    });

    it("respects a subsequent unread counter reset", () => {
        const counter = { current: 4 };
        const dispatch = jest.fn();
        const handler = createNewMessageHandler(counter, dispatch);

        counter.current = -1;
        handler(createMessage("user"));
        handler(createMessage("agent"));

        expect(counter.current).toBe(0);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
            payload: 1
        });
        expect(BroadcastService.postMessage).toHaveBeenCalledTimes(1);
    });
});
