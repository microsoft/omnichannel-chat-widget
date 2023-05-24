import { LogLevel, TelemetryInput } from "../TelemetryConstants";
import { getDomain, isNullOrEmptyString, isNullOrUndefined } from "../../utils";

import { AWTLogConfiguration } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/DataModels";
import { AWTLogManager, AWTLogger } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/webjs/AriaSDK";
import { AWTCustomerContentKind, AWTPiiKind, AWTPropertyType } from "@microsoft/omnichannel-chat-sdk/lib/external/aria/common/Enums";
import { Constants, AriaTelemetryConstants, EnvironmentVersion } from "../../Constants";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { TelemetryManager } from "../TelemetryManager";

const AWTDefaultConfiguration = {
    collectorUri: "https://browser.pipe.aria.microsoft.com/Collector/3.0/",
    cacheMemorySizeLimitInNumberOfEvents: 10000,
    disableCookiesUsage: false,
    canSendStatEvent: (eventName: string) => { return true; }, // eslint-disable-line @typescript-eslint/no-unused-vars
    clockSkewRefreshDurationInMins: 0
};

export const ariaTelemetryLogger = (ariaTelemetryKey: string,
    disabledCookieUsage: boolean,
    collectiorUriForTelemetry: string,
    ariaTelemetryApplicationName: string): IChatSDKLogger => {
    let _logger: AWTLogger;

    // AWTLogManager is a global variable. Reset after a logEvent() is required to prevent collisions with other components using AWTLogManager.
    const resetAriaLogger = (configuration: AWTLogConfiguration = AWTDefaultConfiguration) => {
        AWTLogManager.flushAndTeardown();
        (AWTLogManager as any)._isInitialized = false; // eslint-disable-line @typescript-eslint/no-explicit-any
        (AWTLogManager as any)._isDestroyed = false; // eslint-disable-line @typescript-eslint/no-explicit-any
        _logger = AWTLogManager.initialize(ariaTelemetryKey, configuration);
    };

    const logger = (): AWTLogger => {
        if (!isNullOrEmptyString(ariaTelemetryKey)) {
            const configuration: AWTLogConfiguration = {
                disableCookiesUsage: disabledCookieUsage
            };

            if (!isNullOrEmptyString(collectiorUriForTelemetry)) {
                configuration.collectorUri = collectiorUriForTelemetry;
            } else {
                if (TelemetryManager.InternalTelemetryData.environmentVersion == EnvironmentVersion.prod) {
                    const orgUrl = TelemetryManager.InternalTelemetryData?.orgUrl;
                    if (!isNullOrUndefined(orgUrl)) {
                        // If the given org is a Production EU org, modify the Aria collector uri
                        const region = getDomain(orgUrl);

                        if (region === AriaTelemetryConstants.EU) {
                            configuration.collectorUri = AriaTelemetryConstants.EUROPE_ENDPOINT;
                        }
                    }
                }
            }

            try {
                resetAriaLogger(configuration);
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
            try {
                const telemetryInfo = telemetryInput?.telemetryInfo?.telemetryInfo;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const eventProperties: any = { name: telemetryInput.scenarioType, properties: {} };
                if (telemetryInfo) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    (Object.keys(telemetryInfo) as (keyof typeof telemetryInfo)[]).forEach((key, index) => {
                        if (!isNullOrUndefined(telemetryInfo[key]) && !isNullOrEmptyString(telemetryInfo[key])) {
                            const property = {
                                value: typeof (telemetryInfo[key]) === "object" ? JSON.stringify(telemetryInfo[key]) : telemetryInfo[key],
                                type: typeof (telemetryInfo[key]) === "number" ? AWTPropertyType.Double : AWTPropertyType.String,
                                pii: AWTPiiKind.NotSet,
                                cc: AWTCustomerContentKind.NotSet
                            };
                            eventProperties.properties[key] = property;
                        }
                    });

                    const nameProperty = { value: Constants.LiveChatWidget, type: AWTPropertyType.String, pii: AWTPiiKind.GenericData, cc: AWTCustomerContentKind.NotSet };
                    eventProperties.properties[ariaTelemetryApplicationName] = nameProperty;
                }

                logger() ? logger().logEvent(eventProperties) : console.log("Unable to initialize aria logger");
                resetAriaLogger();
            }
            catch (error) {
                console.error("Error in logging telemetry to Aria logger:" + error);
            }
        },
        dispose: () => {
            AWTLogManager.flush(function () { console.log("Aria logger disposed"); });
        }
    };
    return ariaLogger;
};