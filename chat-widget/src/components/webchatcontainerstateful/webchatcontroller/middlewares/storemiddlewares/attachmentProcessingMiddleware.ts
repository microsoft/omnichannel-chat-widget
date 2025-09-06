/******
 * AttachmentProcessingMiddleware
 * 
 * Handles attachment sending.
 ******/

import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const attachmentProcessingMiddleware = () => (next: any) => async (action: IWebChatAction) => {
    if (action?.type === WebChatActionType.WEB_CHAT_SEND_MESSAGE && action?.payload?.attachments?.length > 0) {
        // Always allow multiple attachments to be sent together
        return next(action);
    }

    return next(action);
};

export default attachmentProcessingMiddleware;