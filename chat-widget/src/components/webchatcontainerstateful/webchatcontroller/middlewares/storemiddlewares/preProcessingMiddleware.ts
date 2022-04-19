/******
 * PreProcessingMiddleware
 * 
 * Adds necessary fields for the activity for the other middlewares to function as expected.
 ******/

import { Constants } from "../../../../../common/Constants";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
const preProcessingMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => async (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_POST_ACTIVITY) {
        const { activity } = action.payload;
        if (!activity.from || activity.from.role === Constants.userMessageTag) {
            action = {
                ...action,
                payload: {
                    ...action.payload,
                    activity: {
                        ...action.payload.activity,
                        textFormat: Constants.markdown
                    }
                }
            };
        }
    }

    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        const { activity } = action.payload;
        if (activity) {
            action.payload.activity[Constants.actionType] = WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY;
        }
    }

    return next(action);
};

export default preProcessingMiddleware;
