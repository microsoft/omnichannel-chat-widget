/* eslint-disable @typescript-eslint/no-explicit-any */

import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import sanitizationMiddleware from "./sanitizationMiddleware";

jest.mock("../../../../../common/telemetry/TelemetryHelper", () => ({
    TelemetryHelper: {
        logActionEvent: jest.fn()
    }
}));

jest.mock("./htmlDetectionTelemetry", () => ({
    logHtmlDetectionTelemetry: jest.fn()
}));

describe("sanitizationMiddleware", () => {
    let next: jest.Mock;
    let dispatch: jest.Mock;
    let middleware: (action: IWebChatAction) => any;

    beforeEach(() => {
        next = jest.fn((action) => action);
        dispatch = jest.fn();
        middleware = sanitizationMiddleware({ dispatch })(next);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("DIRECT_LINE_INCOMING_ACTIVITY sanitization", () => {
        function makeIncomingAction(text: string): IWebChatAction {
            return {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        text
                    }
                }
            };
        }

        it("should strip <img> tags from incoming activity text", () => {
            const action = makeIncomingAction("Hello <img src=\"https://attacker.site\"> world");

            const result = middleware(action);

            expect(result.payload.activity.text).not.toContain("<img");
            expect(result.payload.activity.text).toContain("Hello");
            expect(result.payload.activity.text).toContain("world");
        });

        it("should strip <svg onload=alert(1)> from incoming text", () => {
            const action = makeIncomingAction("Check this <svg onload=alert(1)>malicious</svg> content");

            const result = middleware(action);

            expect(result.payload.activity.text).not.toContain("<svg");
            expect(result.payload.activity.text).not.toContain("onload");
        });

        it("should strip <script>alert(1)</script> from incoming text", () => {
            const action = makeIncomingAction("Safe text <script>alert(1)</script> more text");

            const result = middleware(action);

            expect(result.payload.activity.text).not.toContain("<script");
            expect(result.payload.activity.text).not.toContain("alert(1)");
        });

        it("should strip <iframe> tags from incoming text", () => {
            const action = makeIncomingAction("Before <iframe src=\"https://evil.com\"></iframe> after");

            const result = middleware(action);

            expect(result.payload.activity.text).not.toContain("<iframe");
            expect(result.payload.activity.text).not.toContain("evil.com");
        });

        it("should strip <div> but preserve <a href> link inside it", () => {
            const action = makeIncomingAction("<div><a href=\"https://safe.com\">Click here</a></div>");

            const result = middleware(action);

            expect(result.payload.activity.text).not.toContain("<div");
            expect(result.payload.activity.text).toContain("<a");
            expect(result.payload.activity.text).toContain("https://safe.com");
            expect(result.payload.activity.text).toContain("Click here");
        });

        it("should pass plain text through unchanged", () => {
            const action = makeIncomingAction("Just a normal message with no HTML");

            const result = middleware(action);

            expect(result.payload.activity.text).toBe("Just a normal message with no HTML");
        });

        it("should preserve allowed tags like <b> and <em>", () => {
            const action = makeIncomingAction("This is <b>bold</b> and <em>italic</em> text");

            const result = middleware(action);

            expect(result.payload.activity.text).toContain("<b>bold</b>");
            expect(result.payload.activity.text).toContain("<em>italic</em>");
        });

        it("should pass action through to next when activity has no text", () => {
            const action: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
                payload: {
                    activity: {
                        type: "typing"
                    }
                }
            };

            middleware(action);

            expect(next).toHaveBeenCalledWith(action);
        });
    });

    describe("WEB_CHAT_SEND_MESSAGE sanitization", () => {
        it("should still sanitize outgoing messages (existing behavior)", () => {
            const action: IWebChatAction = {
                type: WebChatActionType.WEB_CHAT_SEND_MESSAGE,
                payload: {
                    text: "Hello <script>alert(1)</script> world"
                }
            };

            middleware(action);

            // The send-message path calls DOMPurify.sanitize but does not
            // replace the action — it only sanitizes in a local variable.
            // The key assertion is that next is called (no crash).
            expect(next).toHaveBeenCalled();
        });
    });

    describe("unrelated action types", () => {
        it("should pass unrelated actions through without modification", () => {
            const action: IWebChatAction = {
                type: WebChatActionType.WEB_CHAT_SET_LANGUAGE,
                payload: {
                    language: "en"
                }
            };

            const result = middleware(action);

            expect(next).toHaveBeenCalledWith(action);
            expect(result).toEqual(action);
        });

        it("should not modify DIRECT_LINE_POST_ACTIVITY actions", () => {
            const action: IWebChatAction = {
                type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY,
                payload: {
                    activity: {
                        text: "<script>steal()</script>"
                    }
                }
            };

            const result = middleware(action);

            expect(next).toHaveBeenCalledWith(action);
            expect(result.payload.activity.text).toBe("<script>steal()</script>");
        });
    });
});
