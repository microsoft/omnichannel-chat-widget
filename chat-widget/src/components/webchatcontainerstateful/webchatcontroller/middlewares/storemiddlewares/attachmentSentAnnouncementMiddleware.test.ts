import attachmentSentAnnouncementMiddleware from "./attachmentSentAnnouncementMiddleware";
import { WebChatActionType } from "../../enums/WebChatActionType";

describe("attachmentSentAnnouncementMiddleware", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dispatch: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let next: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let middleware: any;
    let container: HTMLDivElement;

    beforeEach(() => {
        dispatch = jest.fn();
        next = jest.fn((action) => action);
        middleware = attachmentSentAnnouncementMiddleware({ dispatch })(next);

        // Set up the DOM with the widget container
        container = document.createElement("div");
        container.id = "oc-lcw-container";
        document.body.appendChild(container);

        jest.useFakeTimers();
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.useRealTimers();
    });

    test("passes non-attachment actions through without announcing", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY,
            payload: { activity: { text: "hello" } }
        };

        middleware(action);

        expect(next).toHaveBeenCalledWith(action);
        const region = document.getElementById("oc-lcw-attachment-announcement");
        expect(region).toBeNull();
    });

    test("announces when a single file attachment is sent", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "test.pdf", contentType: "application/pdf" }]
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(150);

        expect(next).toHaveBeenCalledWith(action);
        const region = document.getElementById("oc-lcw-attachment-announcement");
        expect(region).not.toBeNull();
        expect(region?.textContent).toBe("File sent");
        expect(region?.getAttribute("aria-live")).toBe("polite");
        expect(region?.getAttribute("role")).toBe("status");
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
        jest.advanceTimersByTime(150);

        const region = document.getElementById("oc-lcw-attachment-announcement");
        expect(region?.textContent).toBe("3 files sent");
    });

    test("does not announce for POST_ACTIVITY_FULFILLED without attachments", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    text: "just a text message"
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(150);

        const region = document.getElementById("oc-lcw-attachment-announcement");
        expect(region).toBeNull();
    });

    test("creates aria-live region inside oc-lcw-container", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "doc.pdf", contentType: "application/pdf" }]
                }
            }
        };

        middleware(action);

        const region = document.getElementById("oc-lcw-attachment-announcement");
        expect(region).not.toBeNull();
        expect(container.contains(region)).toBe(true);
    });

    test("reuses existing aria-live region on subsequent announcements", () => {
        const action = {
            type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
            payload: {
                activity: {
                    attachments: [{ name: "doc.pdf", contentType: "application/pdf" }]
                }
            }
        };

        middleware(action);
        jest.advanceTimersByTime(150);
        middleware(action);
        jest.advanceTimersByTime(150);

        const regions = document.querySelectorAll("#oc-lcw-attachment-announcement");
        expect(regions.length).toBe(1);
    });
});
