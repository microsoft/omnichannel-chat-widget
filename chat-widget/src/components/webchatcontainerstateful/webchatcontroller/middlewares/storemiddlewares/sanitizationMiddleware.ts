/******
 * SanitizationMiddleware
 * 
 * Sanitizes the text.
 ******/

import DOMPurify from "dompurify";
import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { WebChatStoreMiddleware, isWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sanitizationMiddleware: WebChatStoreMiddleware = ({ dispatch }) => (next) => (action) => {
    if (!isWebChatAction(action)) {
        return next(action);
    }

    if (action.type === WebChatActionType.WEB_CHAT_SEND_MESSAGE) {
        try {
            let text = action.payload?.text;
            if (text) {
                text = DOMPurify.sanitize(text, {ADD_ATTR: ["target"]}) ?? " ";
            }
        } catch (e) {
            const copyDataForTelemetry = {
                ...action,
                payload: {
                    ...action.payload,
                    text: undefined,
                }
            };
            let errorMessage = "Failed to apply action: ";
            try {
                errorMessage += JSON.stringify(copyDataForTelemetry);
            } catch (e) {
                errorMessage += " (unable to stringify action)";
            }
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ProcessingSanitizationMiddlewareFailed,
                ExceptionDetails: {
                    ErrorData: errorMessage,
                    Exception: e
                }
            });
        }
    }

    return next(action);
};

export default sanitizationMiddleware;
