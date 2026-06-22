import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// Appends a visually-hidden text node to the webchat transcript (role="log")
// so screen readers announce the confirmation after a file is sent.
// Using the existing live log is the most reliable approach on Android TalkBack —
// role="alert" elements are ignored when aria-modal is active on the dialog.
// No ARIA role on the child keeps the announcement clean ("File sent", not "File sent, status").
const announce = (message: string): void => {
    setTimeout(() => {
        const log = document.querySelector("[role=\"log\"]") as HTMLElement | null;
        if (!log) return;

        const el = document.createElement("div");
        el.textContent = message;
        el.style.cssText = "position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;";
        log.appendChild(el);

        setTimeout(() => {
            el.parentNode?.removeChild(el);
        }, 3000);
    }, 300);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const attachmentSentAnnouncementMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    // Intercept successfully posted activities that contain attachments
    if (action?.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED) {
        const attachments = action?.payload?.activity?.attachments;
        if (attachments && attachments.length > 0) {
            const count = attachments.length;
            const message = count === 1
                ? "File sent"
                : `${count} files sent`;
            announce(message);
        }
    }
    return next(action);
};

export default attachmentSentAnnouncementMiddleware;
