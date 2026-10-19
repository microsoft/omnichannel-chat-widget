/******
 * AttachmentSentAnnouncementMiddleware
 *
 * When a file attachment is successfully sent, announces the result to
 * screen readers so that assistive technology users receive immediate
 * feedback ("File report.pdf sent").
 *
 * The announcement region lives inside the chat dialog. While the dialog is
 * open it is aria-modal and its host siblings are aria-hidden, so screen
 * readers (TalkBack, VoiceOver) ignore live regions outside it.
 ******/

import { ILiveChatWidgetLocalizedTexts } from "../../../../../contexts/common/ILiveChatWidgetLocalizedTexts";
import { WebChatStoreMiddleware, isWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

export const ATTACHMENT_ANNOUNCEMENT_REGION_ID = "oc-lcw-attachment-announcement";

const DEFAULT_FILE_SENT_TEXT = "File {2} sent";
const DEFAULT_FILES_SENT_TEXT = "{0} files sent";

// Let the send-box focus shift settle before speaking, then keep the node
// long enough for the screen reader to read it.
const ANNOUNCE_DELAY_MS = 100;
const ANNOUNCEMENT_LIFETIME_MS = 5000;

/**
 * Ensures a visually-hidden aria-live region exists inside the chat dialog
 * for announcing attachment upload results to screen readers.
 */
const ensureAriaLiveRegion = (widgetElementId: string): HTMLElement => {
    const host = document.getElementById(widgetElementId) || document.body;
    let region = document.getElementById(ATTACHMENT_ANNOUNCEMENT_REGION_ID);
    if (!region) {
        region = document.createElement("div");
        region.id = ATTACHMENT_ANNOUNCEMENT_REGION_ID;
        region.setAttribute("aria-live", "polite");
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
    }
    if (region.parentElement !== host) {
        host.appendChild(region);
    }
    return region;
};

/**
 * Announces a message by appending a fresh node to the live region.
 * TalkBack reliably speaks newly added nodes but often misses text changes
 * on an existing node, so each announcement gets its own element.
 */
const announce = (message: string, widgetElementId: string): void => {
    const region = ensureAriaLiveRegion(widgetElementId);
    setTimeout(() => {
        const node = document.createElement("div");
        node.textContent = message;
        region.appendChild(node);
        setTimeout(() => node.remove(), ANNOUNCEMENT_LIFETIME_MS);
    }, ANNOUNCE_DELAY_MS);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFileSentMessage = (attachments: any[], localizedTexts?: ILiveChatWidgetLocalizedTexts): string => {
    if (attachments.length > 1) {
        return (localizedTexts?.MIDDLEWARE_BANNER_FILES_SENT || DEFAULT_FILES_SENT_TEXT)
            .replace("{0}", String(attachments.length));
    }
    const name = typeof attachments[0]?.name === "string" ? attachments[0].name.trim() : "";
    return (localizedTexts?.MIDDLEWARE_BANNER_FILE_SENT || DEFAULT_FILE_SENT_TEXT)
        .replace("{2}", name)
        .replace(/\s{2,}/g, " ")
        .trim();
};

export const createAttachmentSentAnnouncementMiddleware = (localizedTexts?: ILiveChatWidgetLocalizedTexts, widgetElementId = "oc-lcw"): WebChatStoreMiddleware =>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ({ dispatch }) => (next) => (action) => {
        if (!isWebChatAction(action)) {
            return next(action);
        }

        // Intercept successfully posted activities that contain attachments
        if (action.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED) {
            const attachments = action.payload?.activity?.attachments;
            if (attachments && attachments.length > 0) {
                announce(getFileSentMessage(attachments, localizedTexts), widgetElementId);
            }
        }
        return next(action);
    };

export default createAttachmentSentAnnouncementMiddleware;
