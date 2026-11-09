import { BroadcastService } from "@microsoft/omnichannel-chat-components";
import { BroadcastEvent } from "../../../common/telemetry/TelemetryConstants";
import { AudioNotificationStateful } from "../../footerstateful/audionotificationstateful/AudioNotificationStateful";
import type { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import LiveChatVersion from "@microsoft/omnichannel-chat-sdk/lib/core/LiveChatVersion";
import { LiveChatWidgetActionType } from "../../../contexts/common/LiveChatWidgetActionType";
import type OmnichannelMessage from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";
import { PersonType, ResourceType } from "@microsoft/omnichannel-chat-sdk/lib/core/messaging/OmnichannelMessage";
import { createNewMessageHandler } from "./createNewMessageHandler";
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { Subject } from "rxjs";

jest.mock("@microsoft/omnichannel-chat-components", () => ({
    BroadcastService: { postMessage: jest.fn(), getMessageByEventName: jest.fn() }
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

    afterEach(() => {
        cleanup();
        jest.restoreAllMocks();
        jest.mocked(BroadcastService.postMessage).mockReset();
    });

    it("does not play notification audio for edits, but still plays it for a new agent message", () => {
        const notifications = new Subject<ICustomEvent>();
        jest.mocked(BroadcastService.getMessageByEventName).mockReturnValue(notifications);
        jest.mocked(BroadcastService.postMessage).mockImplementation(event => notifications.next(event));
        const play = jest.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
        render(createElement(AudioNotificationStateful, { isAudioMuted: false }));
        const counter = { current: 4 };
        const handler = createNewMessageHandler(counter, jest.fn());

        for (const role of ["agent", "user", "bot", "system"]) {
            handler({ ...createMessage(role), resourceType: ResourceType.MessageUpdate });
        }

        expect(play).not.toHaveBeenCalled();
        expect(counter.current).toBe(4);
        handler({ ...createMessage("agent"), id: "new-agent-message" });
        expect(play).toHaveBeenCalledTimes(1);
        expect(counter.current).toBe(5);
        notifications.complete();
    });

    describe.each([-1, 4])("edits with message counter %i", initialCount => {
        it.each(["agent", "user", "bot", "system", "channel", "unknown", undefined])(
            "does not change unread or broadcast the sound notification for an edit with role %s",
            role => {
                const counter = { current: initialCount };
                const dispatch = jest.fn();
                const handler = createNewMessageHandler(counter, dispatch);

                handler({ ...createMessage(role), resourceType: ResourceType.MessageUpdate });

                expect(counter.current).toBe(initialCount);
                expect(dispatch).not.toHaveBeenCalled();
                expect(BroadcastService.postMessage).not.toHaveBeenCalled();
            }
        );
    });

    it("ignores first-seen and repeated edits but still notifies for a subsequent new agent message", () => {
        const counter = { current: 4 };
        const dispatch = jest.fn();
        const handler = createNewMessageHandler(counter, dispatch);
        const edit = { ...createMessage("agent", "********"), resourceType: ResourceType.MessageUpdate };

        handler(edit);
        handler(edit);
        handler({ ...createMessage("agent"), id: "new-agent-message", resourceType: ResourceType.NewMessage });
        handler(edit);

        expect(counter.current).toBe(5);
        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith({
            type: LiveChatWidgetActionType.SET_UNREAD_MESSAGE_COUNT,
            payload: 6
        });
        expect(BroadcastService.postMessage).toHaveBeenCalledTimes(1);
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
