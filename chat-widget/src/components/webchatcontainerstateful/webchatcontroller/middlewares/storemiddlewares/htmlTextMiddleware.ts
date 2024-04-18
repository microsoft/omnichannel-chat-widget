/******
 * HTMLTextMiddleware
 * 
 * Ensures that links within messages are processed so that the caller website cannot be traced.
 ******/

import { Constants, HtmlAttributeNames } from "../../../../../common/Constants";

import DOMPurify from "dompurify";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";
import updateIn from "simple-update-in";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertTextToHtmlNode = (text: string): any => {
    if (!text) return "";
    const element = document.createElement(HtmlAttributeNames.div);
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        text = DOMPurify.sanitize(text);
        element.innerHTML = text;
    } catch (e) {
        const errorMessage = `Failed to purify and set innertHTML with text: ${text}`;
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.ProcessingHTMLTextMiddlewareFailed,
            ExceptionDetails: {
                ErrorData: errorMessage,
                Exception: e
            }
        });
    }
    return element;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processHTMLText = (action: IWebChatAction, text: string): IWebChatAction => {
    const htmlNode = convertTextToHtmlNode(text);
    const aNodes = htmlNode.getElementsByTagName(HtmlAttributeNames.aTagName);
    if (aNodes?.length > 0) {
        try {
            for (let index = 0; index < aNodes.length; index++) {
                const aNode = aNodes[index];
                // Skip if the node is not valid or the node's tag name is not equal to 'a', or the node href is empty.
                if (aNode.tagName?.toLowerCase() !== HtmlAttributeNames.aTagName || !aNode.href) {
                    continue;
                }

                // Add target to 'a' node if target is missing or does not equal to blank
                if (!aNode.target || aNode.target !== Constants.blank)
                {
                    aNode.target = Constants.blank;
                }

                // If rel is missing or rel does not include noopener and noreferrer, add them
                if (!aNode.rel) {
                    aNode.rel = `${HtmlAttributeNames.noopenerTag} ${HtmlAttributeNames.noreferrerTag}`;
                } else {
                    if (aNode.rel.indexOf(HtmlAttributeNames.noopenerTag) === -1) {
                        aNode.rel += ` ${HtmlAttributeNames.noopenerTag}`;
                    }
                    if (aNode.rel.indexOf(HtmlAttributeNames.noreferrerTag) === -1) {
                        aNode.rel += ` ${HtmlAttributeNames.noreferrerTag}`;
                    }
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            action = updateIn(action, [Constants.payload, Constants.activity, Constants.text], () => htmlNode.innerHTML);
        }
        catch (e) {
            let errorMessage = "Failed to apply action: ";
            try {
                errorMessage += JSON.stringify(action);
            } catch (e) {
                errorMessage += " (unable to stringify action)";
            }
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ProcessingHTMLTextMiddlewareFailed,
                ExceptionDetails: {
                    ErrorData: errorMessage,
                    Exception: e
                }
            });
        }
    }
    
    return action;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const htmlTextMiddleware = ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (action.type === WebChatActionType.DIRECT_LINE_INCOMING_ACTIVITY) {
        try {
            const text = action.payload?.activity?.text;
            if (text) {
                action = processHTMLText(action, text);
            }
        } catch (e) {
            let errorMessage = "Failed to validate action.";
            try {
                errorMessage += JSON.stringify(action);
            } catch (e) {
                errorMessage += " (unable to stringify action)";
            }
            TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                Event: TelemetryEvent.ProcessingHTMLTextMiddlewareFailed,
                ExceptionDetails: {
                    ErrorData: errorMessage,
                    Exception: e
                }
            });
        }
    }

    return next(action);
};

export default htmlTextMiddleware;
