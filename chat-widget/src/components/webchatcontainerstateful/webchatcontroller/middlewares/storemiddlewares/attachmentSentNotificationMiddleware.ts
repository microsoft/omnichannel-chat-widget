/******
 * AttachmentSentNotificationMiddleware
 *
 * Announces a screen reader message when a file attachment has been successfully sent.
 * Intercepts DIRECT_LINE/POST_ACTIVITY_FULFILLED and, if the activity contains attachments,
 * triggers an aria-live announcement so that users relying on screen readers (e.g. TalkBack,
 * VoiceOver, NVDA) are informed that the file was sent.
 ******/

import { ILiveChatWidgetLocalizedTexts } from "../../../../../contexts/common/ILiveChatWidgetLocalizedTexts";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { announceForScreenReader } from "../../../../../common/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createAttachmentSentNotificationMiddleware = (localizedTexts: ILiveChatWidgetLocalizedTexts) => () => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY_FULFILLED) {
        const attachments = action?.payload?.activity?.attachments;
        if (attachments && attachments.length > 0) {
            const message = localizedTexts.MIDDLEWARE_MESSAGE_DELIVERED ?? "Sent";
            announceForScreenReader(message);
        }
    }
    return next(action);
};

export default createAttachmentSentNotificationMiddleware;
