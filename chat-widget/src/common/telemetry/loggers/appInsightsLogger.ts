import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { LogLevel, TelemetryEvent, TelemetryInput } from "../TelemetryConstants";
import ScenarioMarker from "../ScenarioMarker";
import { TelemetryHelper } from "../TelemetryHelper";
import { AppInsightsTelemetryMessage } from "../../Constants";

enum AllowedKeys {
  LogLevel = "LogLevel",
  Description = "Description",
  ExceptionDetails = "ExceptionDetails",
  ChannelId = "ChannelId",
  LCWRuntimeId = "ClientSessionId",
  ConversationId = "LiveWorkItemId",
  ChatId = "ChatThreadId"
}

export const appInsightsLogger = (appInsightsKey: string, disableCookiesUsage: boolean): IChatSDKLogger => {

    let appInsights: ApplicationInsights | null = null;

    const logger = (): ApplicationInsights | null => {
        if (!appInsights && appInsightsKey) {
            try {

                const config = {
                    ...appInsightsKey.includes("IngestionEndpoint") ? { connectionString: appInsightsKey } : { instrumentationKey: appInsightsKey },
                    disableCookiesUsage: disableCookiesUsage,
                };
                
                // Initialize Application Insights 
                appInsights = new ApplicationInsights({ config });
                appInsights.loadAppInsights();
                TelemetryHelper.logActionEvent(LogLevel.INFO, {
                    Event: TelemetryEvent.AppInsightsInitialized,
                    Description: AppInsightsTelemetryMessage.AppInsightsInitialized
                });
            } catch (error) {
                console.error(AppInsightsTelemetryMessage.AppInsightsInitError, error);
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.AppInsightsInitFailed,
                    Description: AppInsightsTelemetryMessage.AppInsightsInitError,
                    ExceptionDetails: {
                        message : `${AppInsightsTelemetryMessage.AppInsightsInitError} with key ending: ${appInsightsKey.slice(-3)}`,
                        exception: error
                    }
                });
                return null;
            }
        }
        return appInsights;
    };

    const aiLogger: IChatSDKLogger = {
        type: "appInsightsLogger",
        log: (logLevel: LogLevel, telemetryInput: TelemetryInput): void => {
            try {
                const _logger = logger();
                if (!_logger) return;
                const eventName = telemetryInput?.payload?.Event;
                const telemetryInfo = telemetryInput?.telemetryInfo?.telemetryInfo;
                const eventProperties = setEventProperties(telemetryInfo);
                
                if (eventName) {
                    const trackingEventName = getTrackingEventName(logLevel, eventName);
                    _logger.trackEvent({ name: trackingEventName, properties: eventProperties });
                }
            } catch (error) {
                console.error("Error in logging telemetry to Application Insights:", error);
            }
        },
        dispose: () => {
            if (appInsights) {
                appInsights.unload(); //flush and unload
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function setEventProperties(telemetryInfo?: any): ICustomProperties {
        const eventProperties: ICustomProperties = {};
        if (telemetryInfo) {
            for (const key in AllowedKeys) {
                const finalKey = AllowedKeys[key as keyof typeof AllowedKeys]; // get renamed keys for LCWRuntimeId, ConversationId, ChatId
                const value = telemetryInfo[key];
                if (value !== undefined && value !== null && value !== "") {
                    eventProperties[finalKey] = value;
                }
            }
        }
        return eventProperties;
    }

    function getTrackingEventName(logLevel: LogLevel, eventName: string): string {
        // Remove "UX" or "LCW" prefix if present
        const event = eventName.replace(/^(UX|LCW)/, "");

        if (logLevel === LogLevel.ERROR) {
            return ScenarioMarker.failScenario(event);
        }
        if (logLevel === LogLevel.WARN) {
            return ScenarioMarker.warnScenario(event);
        }
        if (event.toLowerCase().includes("complete")) {
            return ScenarioMarker.completeScenario(event);
        }
        return ScenarioMarker.startScenario(event);
    }
    return aiLogger;
};

export interface ICustomProperties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}