/**
 * @jest-environment jsdom
 */
import attachmentSentAnnouncementMiddleware from "./attachmentSentAnnouncementMiddleware";
import { WebChatActionType } from "../../enums/WebChatActionType";

describe("attachmentSentAnnouncementMiddleware", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dispatch: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let next: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let middleware: any;

    // Simulate the webchat transcript log element (role="log" aria-live="polite")
    let logEl: HTMLElement;

    beforeEach(() => {
        dispatch = jest.fn();
        next = jest.fn((action) => action);
        middleware = attachmentSentAnnouncementMiddleware({ dispatch })(next);
        jest.useFakeTimers();

        // Create a dialog containing a role="log" element — mirrors the real widget DOM
        const dialog = document.createElement("div");
        dialog.setAttribute("role", "dialog");
        logEl = document.createElement("div");
        logEl.setAttribute("role", "log");
        logEl.setAttribute("aria-live", "polite");
        dialog.appendChild(logEl);
        document.body.appendChild(dialog);
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.useRealTimers();
    });

    // Elements are plain divs — no role so TalkBack reads only the text, not a role name
    const getStatusElements = () =>
        Array.from(logEl.querySelectorAll("div"));

    test("passes non-attachment actions through without announcing", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
            payload: { activity: { text: "hello" } }
        };

        middleware(action);
        jest.runAllTimers();

        expect(next).toHaveBeenCalledWith(action);
        expect(getStatusElements().length).toBe(0);
    });

    test("appends status item to role=log transcript for single file", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "test.pdf", contentType: "application/pdf" }]
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(400);

        expect(next).toHaveBeenCalledWith(action);
        const items = getStatusElements();
        expect(items.length).toBe(1);
        expect(items[0].textContent).toBe("File sent");
    });

    test("announces correct count when multiple files are sent", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [
                        { name: "file1.pdf", contentType: "application/pdf" },
                        { name: "file2.png", contentType: "image/png" },
                        { name: "file3.docx", contentType: "application/msword" }
                    ]
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(400);

        const items = getStatusElements();
        expect(items[0].textContent).toBe("3 files sent");
    });

    test("does not announce for POST_ACTIVITY_FULFILLED without attachments", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: { activity: { text: "just a text message" } }
        };

        middleware(action);
        jest.runAllTimers();

        expect(getStatusElements().length).toBe(0);
    });

    test("status item is inside the role=log transcript (not document.body)", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "doc.pdf", contentType: "application/pdf" }]
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(400);

        expect(getStatusElements().length).toBe(1);
        // Must be inside the log, NOT a direct child of body
        expect(document.body.children.length).toBe(1); // only the dialog wrapper
    });

    test("status item is removed from log after 3 seconds", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "doc.pdf", contentType: "application/pdf" }]
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(400);
        expect(getStatusElements().length).toBe(1);

        jest.advanceTimersByTime(3000);
        expect(getStatusElements().length).toBe(0);
    });

    test("falls back gracefully when no role=log element exists", () => {
        // Remove the log element to test the no-log fallback
        document.body.innerHTML = "";
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "doc.pdf", contentType: "application/pdf" }]
                }
            }
        };

        expect(() => {
            middleware(action);
            jest.runAllTimers();
        }).not.toThrow();
    });
});
