import { Constants } from "../../Constants";
import { LogLevel, TelemetryInput } from "../TelemetryConstants";
import { isNullOrEmptyString, isNullOrUndefined } from "../../utils";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { TelemetryHelper } from "../TelemetryHelper";
import { AWTEventProperties, AWTLogConfiguration, AWTLogger, AWTLogManager, AWTPiiKind } from "@aria/webjs-sdk";

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
            _logger = AWTLogManager.initialize(ariaTelemetryKey, configuration);
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
        }
    };
    return ariaLogger;
};