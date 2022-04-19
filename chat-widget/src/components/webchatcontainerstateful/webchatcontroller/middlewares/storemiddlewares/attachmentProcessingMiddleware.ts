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
        type: WebChatActionType.WEB_CHAT_SEND_FILES
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const attachmentProcessingMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => async (action: IWebChatAction) => {
    if (action?.type === WebChatActionType.WEB_CHAT_SEND_FILES && action?.payload?.files?.length > 0) {
        const files = action.payload.files;

        if (files.length === 1) {
            return next(action);
        }

        const dispatchAction = createSendFileAction(files.slice(0, files.length - 1));
        const nextAction = createSendFileAction([files[files.length - 1]]);

        await dispatch(dispatchAction);
        return next(nextAction);
    }

    return next(action);
};

export default attachmentProcessingMiddleware;
