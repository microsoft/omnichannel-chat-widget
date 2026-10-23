import { ATTACHMENT_ANNOUNCEMENT_REGION_ID, createAttachmentSentAnnouncementMiddleware, getFileSentMessage } from "./attachmentSentAnnouncementMiddleware";
import { WebChatActionType } from "../../enums/WebChatActionType";

const postFulfilled = (attachments?: unknown[]) => ({
    type: WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED,
    payload: { activity: attachments ? { attachments } : { text: "just a text message" } }
});

const spokenTexts = () => Array.from(document.getElementById(ATTACHMENT_ANNOUNCEMENT_REGION_ID)?.children ?? []).map(n => n.textContent);

describe("attachmentSentAnnouncementMiddleware", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let next: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let middleware: any;
    let hostContainer: HTMLDivElement;
    let dialog: HTMLDivElement;

    beforeEach(() => {
        next = jest.fn((action) => action);
        middleware = createAttachmentSentAnnouncementMiddleware()({ dispatch: jest.fn() })(next);

        // Host mount container with the aria-modal chat dialog inside it, as rendered by LiveChatWidgetStateful
        hostContainer = document.createElement("div");
        hostContainer.id = "oc-lcw-container";
        dialog = document.createElement("div");
        dialog.id = "oc-lcw";
        dialog.setAttribute("role", "dialog");
        dialog.setAttribute("aria-modal", "true");
        hostContainer.appendChild(dialog);
        document.body.appendChild(hostContainer);

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
        expect(document.getElementById(ATTACHMENT_ANNOUNCEMENT_REGION_ID)).toBeNull();
    });

    test("does not announce for POST_ACTIVITY_FULFILLED without attachments", () => {
        middleware(postFulfilled());
        jest.advanceTimersByTime(150);

        expect(document.getElementById(ATTACHMENT_ANNOUNCEMENT_REGION_ID)).toBeNull();
    });

    // AB#5905569: the region was in the host container, outside the aria-modal dialog,
    // where TalkBack and VoiceOver ignore it.
    test("creates the live region inside the chat dialog, not in the host container", () => {
        middleware(postFulfilled([{ name: "doc.pdf", contentType: "application/pdf" }]));

        const region = document.getElementById(ATTACHMENT_ANNOUNCEMENT_REGION_ID);
        expect(region?.parentElement).toBe(dialog);
        expect(region?.getAttribute("aria-live")).toBe("polite");
    });

    test("uses a custom widget element id for the dialog", () => {
        dialog.id = "custom-chat-dialog";
        middleware = createAttachmentSentAnnouncementMiddleware(undefined, "custom-chat-dialog")({ dispatch: jest.fn() })(next);

        middleware(postFulfilled([{ name: "doc.pdf" }]));

        expect(document.getElementById(ATTACHMENT_ANNOUNCEMENT_REGION_ID)?.parentElement).toBe(dialog);
    });

    test("moves an existing region into the dialog", () => {
        const stale = document.createElement("div");
        stale.id = ATTACHMENT_ANNOUNCEMENT_REGION_ID;
        hostContainer.appendChild(stale);

        middleware(postFulfilled([{ name: "doc.pdf" }]));

        expect(document.querySelectorAll(`#${ATTACHMENT_ANNOUNCEMENT_REGION_ID}`).length).toBe(1);
        expect(stale.parentElement).toBe(dialog);
    });

    test("announces the file name when a single file is sent", () => {
        middleware(postFulfilled([{ name: "test.pdf", contentType: "application/pdf" }]));
        jest.advanceTimersByTime(150);

        expect(next).toHaveBeenCalled();
        expect(spokenTexts()).toEqual(["File test.pdf sent"]);
    });

    test("announces the count when multiple files are sent", () => {
        middleware(postFulfilled([{ name: "file1.pdf" }, { name: "file2.png" }, { name: "file3.docx" }]));
        jest.advanceTimersByTime(150);

        expect(spokenTexts()).toEqual(["3 files sent"]);
    });

    test("appends a fresh node for each announcement and removes it afterwards", () => {
        middleware(postFulfilled([{ name: "a.pdf" }]));
        jest.advanceTimersByTime(150);
        middleware(postFulfilled([{ name: "a.pdf" }]));
        jest.advanceTimersByTime(150);

        expect(document.querySelectorAll(`#${ATTACHMENT_ANNOUNCEMENT_REGION_ID}`).length).toBe(1);
        expect(spokenTexts()).toEqual(["File a.pdf sent", "File a.pdf sent"]);

        jest.advanceTimersByTime(5000);
        expect(spokenTexts()).toEqual([]);
    });

    test("uses localized overrides", () => {
        middleware = createAttachmentSentAnnouncementMiddleware({
            MIDDLEWARE_BANNER_FILE_SENT: "Fichier {2} envoyé",
            MIDDLEWARE_BANNER_FILES_SENT: "{0} fichiers envoyés"
        })({ dispatch: jest.fn() })(next);

        middleware(postFulfilled([{ name: "a.pdf" }]));
        middleware(postFulfilled([{ name: "a.pdf" }, { name: "b.pdf" }]));
        jest.advanceTimersByTime(150);

        expect(spokenTexts()).toEqual(["Fichier a.pdf envoyé", "2 fichiers envoyés"]);
    });
});

describe("getFileSentMessage", () => {
    test("drops the name placeholder cleanly when the file has no name", () => {
        expect(getFileSentMessage([{ contentType: "image/png" }])).toBe("File sent");
    });

    test("keeps a custom message that has no placeholder", () => {
        expect(getFileSentMessage([{ name: "a.pdf" }], { MIDDLEWARE_BANNER_FILE_SENT: "File sent successfully." })).toBe("File sent successfully.");
    });

    test("inserts file names containing replacement patterns literally", () => {
        expect(getFileSentMessage([{ name: "budget-$&.pdf" }])).toBe("File budget-$&.pdf sent");
        expect(getFileSentMessage([{ name: "cost$$.txt" }])).toBe("File cost$$.txt sent");
        expect(getFileSentMessage([{ name: "q$'1$`.pdf" }])).toBe("File q$'1$`.pdf sent");
    });
});