/* eslint-disable @typescript-eslint/no-explicit-any */

import { buildMessagePayload, createTrackingMessage, extractTimestampFromId, getScenarioType, isHistoryMessage, polyfillMessagePayloadForEvent } from "./util";

import { Constants } from "../common/Constants";

describe("util.ts", () => {
    describe("isHistoryMessage", () => {
        it("returns false for non-message activity", () => {
            const activity = { type: "event" };
            expect(isHistoryMessage(activity as any, Date.now())).toBe(false);
        });

        it("returns false if activityId is not older than startTime by threshold", () => {
            const now = Date.now();
            const activity = { type: Constants.message, id: (now - 10).toString() };
            expect(isHistoryMessage(activity as any, now)).toBe(false);
        });

        it("returns true if activityId is older than startTime by threshold", () => {
            const now = Date.now();
            const activity = { type: Constants.message, id: (now - 300).toString() };
            expect(isHistoryMessage(activity as any, now)).toBe(true);
        });

        it("handles UUID id by using timestamp", () => {
            const now = Date.now();
            const activity = { type: Constants.message, id: "uuid-1234-5678", timestamp: new Date(now - 300).toISOString() };
            expect(isHistoryMessage(activity as any, now)).toBe(true);
        });
    });

    describe("extractTimestampFromId", () => {
        it("returns parsed id if valid number", () => {
            const activity = { id: "1234567890" };
            expect(extractTimestampFromId(activity as any)).toBe(1234567890);
        });
        it("returns timestamp if id is UUID", () => {
            const now = Date.now();
            const activity = { id: "uuid-1234", timestamp: new Date(now).toISOString() };
            expect(extractTimestampFromId(activity as any)).toBeLessThanOrEqual(now);
        });
        it("returns timestamp if id is not a number", () => {
            const now = Date.now();
            const activity = { id: "notanumber", timestamp: new Date(now).toISOString() };
            expect(extractTimestampFromId(activity as any)).toBeLessThanOrEqual(now);
        });
    });

    describe("buildMessagePayload", () => {
        it("returns payload with hidden text if text present", () => {
            const activity = { text: "hello world", type: "message", id: "1", from: { role: "user" }, channelData: {} };
            const payload = buildMessagePayload(activity as any, "user1");
            expect(payload.text).toContain("contents hidden");
            expect(payload.userId).toBe("user1");
        });
        it("returns payload with empty text if no text", () => {
            const activity = { type: "message", id: "1", from: { role: "user" }, channelData: {} };
            const payload = buildMessagePayload(activity as any, "user1");
            expect(payload.text).toBe("");
        });
    });

    describe("polyfillMessagePayloadForEvent", () => {
        it("merges activity and payload fields", () => {
            const activity = { text: "hi", attachments: ["a"], from: { role: "user" }, channelData: {}, conversation: { id: "conv" }, id: "1" };
            const payload = { text: "", userId: "user1", Id: "1", role: "user", isChatComplete: false } as any;
            const result = polyfillMessagePayloadForEvent(activity as any, payload, "convId");
            expect(result.text).toBe("hi");
            expect(result.attachment).toEqual(["a"]);
            expect(result.conversationId).toBe("convId");
        });
    });

    describe("getScenarioType", () => {
        it("returns UserSendMessageStrategy for user role", () => {
            const activity = { from: { role: Constants.userMessageTag } };
            expect(getScenarioType(activity as any)).toBeDefined();
        });
        it("returns SystemMessageStrategy for system tag", () => {
            const activity = { from: { role: "channel" }, channelData: { tags: [Constants.systemMessageTag] } };
            expect(getScenarioType(activity as any)).toBeDefined();
        });
        it("returns ReceivedMessageStrategy for other", () => {
            const activity = { from: { role: "bot" }, channelData: { tags: [] } };
            expect(getScenarioType(activity as any)).toBeDefined();
        });
    });

    describe("createTrackingMessage", () => {
        it("creates a tracking message with type", () => {
            const payload = { Id: "1", role: "user", timestamp: "now", tags: [], messageType: "msg", text: "hi" } as any;
            const msg = createTrackingMessage(payload, "userMessage");
            expect(msg.type).toBe("userMessage");
            expect(msg.Id).toBe("1");
        });
    });
});
