/******
 * GIFUploadMiddleware
 * 
 * Ensures that GIF are properly uploaded.
 ******/

import { Constants } from "../../../../../common/Constants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const gifUploadMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY) {
        const {
            payload: {
                activity
            }
        } = action;

        if (activity?.attachments?.length === activity?.channelData?.attachmentSizes?.length) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activity?.attachments?.forEach((attachment: any) => {
                const { thumbnailUrl, contentUrl, contentType } = attachment;
                if (contentType === Constants.GifContentType && thumbnailUrl !== contentUrl) {
                    attachment.thumbnailUrl = contentUrl;
                }
            });
        }
    }

    return next(action);
};

export default gifUploadMiddleware;
