/******
 * SanitizationMiddleware
 * 
 * Sanitizes the text.
 ******/

import DOMPurify from "dompurify";
import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const sanitizationMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.WEB_CHAT_SEND_MESSAGE) {
        try {
            let text = action.payload?.text;
            if (text) {
                text = DOMPurify.sanitize(text) ?? " ";
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
