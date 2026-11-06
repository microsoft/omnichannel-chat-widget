/******
 * PreProcessingMiddleware
 * 
 * Adds necessary fields for the activity for the other middlewares to function as expected.
 ******/

import { IWebChatAction, WebChatStoreMiddleware, isWebChatAction } from "../../../interfaces/IWebChatAction";

import { Constants } from "../../../../../common/Constants";
import { WebChatActionType } from "../../enums/WebChatActionType";

const preProcessingMiddleware: WebChatStoreMiddleware = () => (next) => async (action) => {
    if (!isWebChatAction(action)) {
        return next(action);
    }

    let currentAction: IWebChatAction = action;

    if (currentAction.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY) {
        const { activity } = currentAction.payload;
        if (!activity.from || activity.from.role === Constants.userMessageTag) {
            currentAction = {
                ...currentAction,
                payload: {
                    ...currentAction.payload,
                    activity: {
                        ...currentAction.payload.activity,
                        textFormat: Constants.markdown
                    }
                }
            };
        }
    }

    if (currentAction.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        const { activity } = currentAction.payload;
        if (activity) {
            currentAction.payload.activity[Constants.actionType] = WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY;
        }
    }

    return next(currentAction);
};

export default preProcessingMiddleware;
