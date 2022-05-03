import { LogLevel, TelemetryInput } from "../TelemetryConstants";
import { isNullOrEmptyString, isNullOrUndefined } from "../../utils";

import AWTEventProperties from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AWTEventProperties";
import { AWTLogConfiguration } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/DataModels";
import AWTLogManager from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AWTLogManager";
import AWTLogger from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AWTLogger";
import { AWTPiiKind } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/common/Enums";
import { Constants } from "../../Constants";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { TelemetryHelper } from "../TelemetryHelper";

export const ariaTelemetryLogger = (ariaTelemetryKey: string,
    disabledCookieUsage: boolean,
    collectiorUriForTelemetry: string,
    ariaTelemetryApplicationName: string): IChatSDKLogger => {
    let _logger: AWTLogger;
    const logger = (): AWTLogger => {
        if (isNullOrUndefined(_logger) &&
            !isNullOrEmptyString(ariaTelemetryKey)) {
            const configuration: AWTLogConfiguration = {
                disableCookiesUsage: disabledCookieUsage
            };

            if (!isNullOrEmptyString(collectiorUriForTelemetry)) {
                configuration.collectorUri = collectiorUriForTelemetry;
            }
            try {
                _logger = AWTLogManager.initialize(ariaTelemetryKey, configuration);
                if (_logger === undefined) {
                    _logger = AWTLogManager.getLogger(ariaTelemetryKey);
                }
            } catch (error) {
                console.log(error);
            }
        }
        return _logger;
    };

    const ariaLogger: IChatSDKLogger = {
        log: (logLevel: LogLevel, telemetryInput: TelemetryInput): void => {
            let property;
            const eventProperties = new AWTEventProperties();
            const event = TelemetryHelper.buildTelemetryEvent(logLevel, telemetryInput);
            eventProperties.setName(telemetryInput.scenarioType);
            for (const key of Object.keys(event)) {
                property = typeof (event[key]) === "object" ? JSON.stringify(event[key]) : event[key];
                eventProperties.setProperty(key, property);
            }
            eventProperties.setPropertyWithPii(ariaTelemetryApplicationName,
                Constants.LiveChatWidget,
                AWTPiiKind.GenericData);
            logger() ? logger().logEvent(eventProperties) : console.log("Unable to initialize aria logger");
        },
        dispose: () => {
            AWTLogManager.flush(function () { console.log("Aria logger disposed"); });
        }
    };
    return ariaLogger;
};