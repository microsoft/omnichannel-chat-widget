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
import { logHtmlDetectionTelemetry } from "./htmlDetectionTelemetry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const sanitizationMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
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

    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        try {
            const text = action.payload?.activity?.text;
            if (text) {
                logHtmlDetectionTelemetry(text);
                const SANITIZE_CONFIG = {
                    ALLOWED_TAGS: ["a", "b", "i", "em", "strong", "u", "s", "p", "br", "ul", "ol", "li", "span", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "code", "blockquote", "hr", "sup", "sub"],
                    FORBID_ATTR: ["action"],
                    ADD_ATTR: ["target"],
                    ALLOW_ATTR: ["href", "target", "rel", "class", "title"]
                };
                const sanitizedText = DOMPurify.sanitize(text, SANITIZE_CONFIG);
                action = {
                    ...action,
                    payload: {
                        ...action.payload,
                        activity: {
                            ...action.payload.activity,
                            text: sanitizedText
                        }
                    }
                };
            }
        } catch (e) {
            const copyDataForTelemetry = {
                ...action,
                payload: {
                    ...action.payload,
                    activity: {
                        ...action.payload?.activity,
                        text: undefined,
                    }
                }
            };
            let errorMessage = "Failed to sanitize incoming activity: ";
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
