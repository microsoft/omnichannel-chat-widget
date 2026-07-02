/* eslint-disable @typescript-eslint/no-explicit-any */

import createAttachmentSentNotificationMiddleware from "./attachmentSentNotificationMiddleware";
import { announceForScreenReader } from "../../../../../common/utils";

jest.mock("../../../../../common/utils", () => ({
    announceForScreenReader: jest.fn(),
}));

const FULFILLED = "DIRECT_LINE/POST_ACTIVITY_FULFILLED";

describe("attachmentSentNotificationMiddleware", () => {
    const localizedTexts: any = { MIDDLEWARE_MESSAGE_DELIVERED: "Attachment sent" };

    afterEach(() => {
        jest.clearAllMocks();
    });

    const run = (action: any, texts: any = localizedTexts) => {
        const next = jest.fn((a) => a);
        const middleware = createAttachmentSentNotificationMiddleware(texts)({} as any)(next);
        const result = middleware(action);
        return { next, result };
    };

    it("announces the delivered message when a fulfilled activity has attachments", () => {
        const action = { type: FULFILLED, payload: { activity: { attachments: [{ contentType: "image/png" }] } } };
        const { next } = run(action);
        expect(announceForScreenReader).toHaveBeenCalledTimes(1);
        expect(announceForScreenReader).toHaveBeenCalledWith("Attachment sent");
        expect(next).toHaveBeenCalledWith(action);
    });

    it("falls back to a default message when no localized text is provided", () => {
        const action = { type: FULFILLED, payload: { activity: { attachments: [{ contentType: "image/png" }] } } };
        run(action, {} as any);
        expect(announceForScreenReader).toHaveBeenCalledWith("Sent");
    });

    it("does not announce when the fulfilled activity has no attachments", () => {
        const action = { type: FULFILLED, payload: { activity: { attachments: [] } } };
        const { next } = run(action);
        expect(announceForScreenReader).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(action);
    });

    it("does not announce for unrelated action types", () => {
        const action = { type: "DIRECT_LINE/INCOMING_ACTIVITY", payload: { activity: { attachments: [{}] } } };
        const { next } = run(action);
        expect(announceForScreenReader).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(action);
    });

    it("passes the action through even when payload is missing", () => {
        const action = { type: FULFILLED };
        const { next, result } = run(action);
        expect(announceForScreenReader).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(action);
        expect(result).toBe(action);
    });
});
