/******
 * AttachmentProcessingMiddleware
 * 
 * Handles attachment sending.
 ******/

import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createSendFileAction = (files: any[]) => {
    return {
        payload: {
            files
        },
        type: WebChatActionType.WEB_CHAT_SEND_MESSAGE
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const attachmentProcessingMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => async (action: IWebChatAction) => {
    console.log("ELOPEZANAYA :: AttachmentProcessingMiddleware", action);
    if (action?.type === WebChatActionType.WEB_CHAT_SEND_MESSAGE && action?.payload?.attachments?.length > 0) {
        console.log("ELOPEZANAYA :: AttachmentProcessingMiddleware - start");
        const files = action.payload.attachments;

        if (files.length === 1) {
            console.log("ELOPEZANAYA :: AttachmentProcessingMiddleware - return");
            return next(action);
        }

        const dispatchAction = createSendFileAction(files.slice(0, files.length - 1));
        const nextAction = createSendFileAction([files[files.length - 1]]);
        console.log("ELOPEZANAYA :: AttachmentProcessingMiddleware - dispatchAction");
        await dispatch(dispatchAction);
        console.log("ELOPEZANAYA :: AttachmentProcessingMiddleware - nextAction");
        return next(nextAction);
    }

    return next(action);
};

export default attachmentProcessingMiddleware;
