import { MessagePayload, ScenarioType } from "./Constants";
import { buildMessagePayload, getScenarioType, isHistoryMessage, polyfillMessagePayloadForEvent } from "./util";

import { Constants } from "../common/Constants";
import { IActivity } from "botframework-directlinejs";

describe("util.ts", () => {
    describe("isHistoryMessage", () => {
        it("should return true if activity has historyMessageTag", () => {
            const activity: IActivity = {
                type: Constants.message,
                channelData: { tags: [Constants.historyMessageTag] },
                id: "123",
            } as IActivity;

            const result = isHistoryMessage(activity, Date.now());
            expect(result).toBe(true);
        });

        it("should return true if activity ID is less than startTime", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (Date.now() - 1000).toString(),
            } as IActivity;

            const result = isHistoryMessage(activity, Date.now());
            expect(result).toBe(true);
        });

        it("should return false if activity ID is greater than startTime", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: (Date.now() + 1000).toString(),
            } as IActivity;

            const result = isHistoryMessage(activity, Date.now());
            expect(result).toBe(false);
        });

        it("should return false if activity type is not a message", () => {
            const activity: IActivity = {
                type: "event",
                id: "123",
            } as IActivity;

            const result = isHistoryMessage(activity, Date.now());
            expect(result).toBe(false);
        });

        it("should return false and log an error if activity ID is invalid", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "null",
            } as IActivity;

            const result = isHistoryMessage(activity, Date.now());
            expect(result).toBe(false);
        });
    });

    describe("buildMessagePayload", () => {
        it("should build a valid MessagePayload from activity", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123",
                timestamp: Date.now().toString(),
                channelData: { tags: ["tag1", "tag2"] },
                from: { id: "user123", role: "user" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: "Hello",
            } as IActivity;

            const userId = "user123";
            const payload = buildMessagePayload(activity, userId);

            expect(payload).toEqual({
                text: "*contents hidden (5 chars)*",
                type: Constants.message,
                timestamp: activity.timestamp,
                userId: userId,
                tags: ["tag1", "tag2"],
                messageType: "",
                Id: "123",
                role: "user",
                isChatComplete: false,
            });
        });

        it("should set text to empty if activity text is undefined", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123",
                timestamp: Date.now().toString(),
                channelData: { tags: ["tag1", "tag2"] },
                from: { id: "user123", role: "user" },
            } as IActivity;

            const userId = "user123";
            const payload = buildMessagePayload(activity, userId);

            expect(payload.text).toBe("");
        });
    });

    describe("polyfillMessagePayloadForEvent", () => {
        it("should merge activity and payload into a new MessagePayload", () => {
            const activity: IActivity = {
                type: Constants.message,
                id: "123",
                channelData: { tags: ["tag1"] },
                conversation: { id: "conv123" },
                from: { id: "bot123", role: "bot" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                text: "Hello",
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                attachments: [{ type: "image" }],
            } as IActivity;

            const payload: MessagePayload = {
                text: "",
                type: Constants.message,
                timestamp: Date.now().toString(),
                userId: "user123",
                tags: [],
                messageType: "",
                Id: "456",
                role: "user",
                isChatComplete: false,
            };

            const conversationId = "conv123";
            const result = polyfillMessagePayloadForEvent(activity, payload, conversationId);

            expect(result).toEqual({
                ...payload,
                channelData: activity.channelData,
                chatId: activity.conversation?.id,
                conversationId: conversationId,
                Id: "123",
                isChatComplete: false,
                text: "Hello",
                attachment: [{ type: "image" }],
                role: "bot",
            });
        });
    });

    describe("getScenarioType", () => {
        it("should return UserSendMessageStrategy if activity role is userMessageTag", () => {
            const activity: IActivity = {
                from: { role: Constants.userMessageTag },
            } as IActivity;

            const result = getScenarioType(activity);
            expect(result).toBe(ScenarioType.UserSendMessageStrategy);
        });

        it("should return SystemMessageStrategy if activity has systemMessageTag", () => {
            const activity: IActivity = {
                channelData: { tags: [Constants.systemMessageTag] },
            } as IActivity;

            const result = getScenarioType(activity);
            expect(result).toBe(ScenarioType.SystemMessageStrategy);
        });

        it("should return ReceivedMessageStrategy for other cases", () => {
            const activity: IActivity = {
                from: { role: "bot" },
            } as IActivity;

            const result = getScenarioType(activity);
            expect(result).toBe(ScenarioType.ReceivedMessageStrategy);
        });
    });
});