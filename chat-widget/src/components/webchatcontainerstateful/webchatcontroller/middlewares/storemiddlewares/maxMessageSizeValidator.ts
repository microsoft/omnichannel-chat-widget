/******
 * MaxMessageSizeValidator
 * 
 * Enforces a max character limit that the sender can send to comply to Omnichannel chat services' limitation.
 ******/

import { ILiveChatWidgetLocalizedTexts } from "../../../../../contexts/common/ILiveChatWidgetLocalizedTexts";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { NotificationHandler } from "../../notification/NotificationHandler";
import { NotificationScenarios } from "../../enums/NotificationScenarios";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { WebChatMiddlewareConstants } from "../../../../../common/Constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createMaxMessageSizeValidator = (localizedTexts: ILiveChatWidgetLocalizedTexts) => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.WEB_CHAT_SET_SEND_BOX) {
        const textLength = action.payload?.text?.length as number || 0;
        if (textLength > WebChatMiddlewareConstants.maxTextLength) {
            NotificationHandler.notifyError(
                NotificationScenarios.MaxSizeError,
                localizedTexts.MIDDLEWARE_MAX_CHARACTER_COUNT_EXCEEDED as string);
            return next(action);

        }
        else {
            NotificationHandler.dismissNotification(NotificationScenarios.MaxSizeError);
        }
    }

    return next(action);
};

export default createMaxMessageSizeValidator;
