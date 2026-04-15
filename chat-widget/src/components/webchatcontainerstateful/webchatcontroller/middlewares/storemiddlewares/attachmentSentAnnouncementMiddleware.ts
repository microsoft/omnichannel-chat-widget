/******
 * AttachmentSentAnnouncementMiddleware
 *
 * When a file attachment is successfully sent, announces the result to
 * screen readers via an aria-live region so that assistive technology
 * users receive immediate feedback.
 ******/

import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

const ARIA_LIVE_REGION_ID = "oc-lcw-attachment-announcement";

/**
 * Ensures a visually-hidden aria-live region exists in the DOM for
 * announcing attachment upload results to screen readers.
 */
const ensureAriaLiveRegion = (): HTMLElement => {
    let region = document.getElementById(ARIA_LIVE_REGION_ID);
    if (!region) {
        region = document.createElement("div");
        region.id = ARIA_LIVE_REGION_ID;
        region.setAttribute("aria-live", "polite");
        region.setAttribute("role", "status");
        region.setAttribute("aria-atomic", "true");
        // Visually hidden but available to screen readers
        Object.assign(region.style, {
            position: "absolute",
            width: "1px",
            height: "1px",
            padding: "0",
            margin: "-1px",
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: "0"
        });
        const container = document.getElementById("oc-lcw-container");
        (container || document.body).appendChild(region);
    }
    return region;
};

/**
 * Announces a message to screen readers by updating the aria-live region.
 * Clears it briefly first so repeated identical messages are still announced.
 */
const announce = (message: string): void => {
    const region = ensureAriaLiveRegion();
    region.textContent = "";
    // Small delay so the screen reader detects the content change
    setTimeout(() => {
        region.textContent = message;
    }, 100);
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
