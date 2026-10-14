/******
 * HTMLPlayerMiddleware
 * 
 * Ensures that video/audio attachment are properly rendered.
 ******/

import { Constants } from "../../../../../common/Constants";
import { WebChatStoreMiddleware, isWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

const disableHTMLPlayerDownloadButton = (htmlTag: string) => {
    setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const elements: any = document.getElementsByTagName(htmlTag);
        for (let index = 0; index < elements.length; index++) {
            if (!elements[index].getAttribute(Constants.controlsList)) {
                elements[index].setAttribute(Constants.controlsList, Constants.nodownload);
            }
            else {
                if (elements[index].getAttribute(Constants.controlsList).indexOf(Constants.nodownload) === -1) {
                    const currentControlsListValue = elements[index].getAttribute(Constants.controlsList);
                    elements[index].setAttribute(Constants.controlsList, `${currentControlsListValue} ${Constants.nodownload}`);
                }
            }
        }
    }, 500);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const htmlPlayerMiddleware: WebChatStoreMiddleware = ({ dispatch }) => (next) => (action) => {
    if (!isWebChatAction(action)) {
        return next(action);
    }

    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY && action.payload?.activity?.attachments?.length > 0) {
        disableHTMLPlayerDownloadButton(Constants.video);
        disableHTMLPlayerDownloadButton(Constants.audio);
    }

    return next(action);
};

export default htmlPlayerMiddleware;
