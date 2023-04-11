/******
 * DataMaskingMiddleware
 *
 * Applies data masking rules that Omnichannel Admin has configured.
 ******/

import { LogLevel, TelemetryEvent } from "../../../../../common/telemetry/TelemetryConstants";

import { IDataMaskingInfo } from "../../../interfaces/IDataMaskingInfo";
import { IDataMaskingRule } from "../../../interfaces/IDataMaskingRule";
import { IWebChatAction } from "../../../interfaces/IWebChatAction";
import { TelemetryHelper } from "../../../../../common/telemetry/TelemetryHelper";
import { WebChatActionType } from "../../enums/WebChatActionType";
import { isMaskingforCustomer } from "../../../common/utils/isMaskingFromCustomer";

const applyDataMasking = (action: IWebChatAction, regexCollection: IDataMaskingRule): IWebChatAction => {
    const maskedChar = "#"; //to do: load from env once OC SDK supporting.
    let { text } = action.payload;

    if (!regexCollection) {
        TelemetryHelper.logActionEvent(LogLevel.ERROR, {
            Event: TelemetryEvent.InvalidConfiguration,
            ExceptionDetails: {
                ErrorDetails: "Invalid data masking rules"
            }
        });
        return action;
    }

    for (const ruleId of Object.keys(regexCollection)) {
        const item = regexCollection[ruleId];
        if (item) {
            let ruleInfiniteException = false;
            let ruleApplied = false;
            try {
                const regex = new RegExp(item, "gi");
                let match;
                // eslint-disable-next-line no-cond-assign
                while (match = regex.exec(text)) {
                    const replaceStr = match[0].replace(/./gi, maskedChar);
                    const modifiedText = text.replace(match[0], replaceStr);
                    if (modifiedText == text) {
                        ruleInfiniteException = true;
                        console.warn(`The data masking rule ${item} is ignored because it matches empty strings. Please modify this rule.`);
                        break;
                    } 
                    
                    ruleApplied = true;
                    text = modifiedText;
                }
            } catch (err) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.DataMaskingRuleApplyFailed,
                    ExceptionDetails: {
                        RuleId: ruleId,
                        Exception: err
                    }
                });
            }

            if (ruleApplied) {
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.DataMaskingRuleApplied,
                    Description: `Data Masking Rule Id: ${ruleId} applied.`
                });
            }

            if (ruleInfiniteException) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.DataMaskingRuleApplyFailed,
                    ExceptionDetails: {
                        RuleId: ruleId,
                        Exception: "The data masking rule matches empty strings."
                    }
                });
            }
        }
    }

    action.payload.text = text;
    return action;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const createDataMaskingMiddleware = (dataMaskingInfo: IDataMaskingInfo) => ({ dispatch }: { dispatch: any }) => (next: any) => (action: IWebChatAction) => {
    if (isMaskingforCustomer(dataMaskingInfo) && action.payload?.text && action.type === WebChatActionType.WEB_CHAT_SEND_MESSAGE) {
        const regexCollection = dataMaskingInfo?.dataMaskingRules;
        return next(applyDataMasking(action, regexCollection as IDataMaskingRule));
    }
    return next(action);
};

export default createDataMaskingMiddleware;
