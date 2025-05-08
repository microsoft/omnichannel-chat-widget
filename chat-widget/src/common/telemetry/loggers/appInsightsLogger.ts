import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { LogLevel, TelemetryEvent, TelemetryInput } from "../TelemetryConstants";
import ScenarioMarker from "../ScenarioMarker";
import { TelemetryHelper } from "../TelemetryHelper";

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
                    Description: "Application Insights initialized successfully."
                });
            } catch (error) {
                console.error("Error initializing Application Insights: ", error);
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.AppInsightsInitFailed,
                    Description: "Error initializing Application Insights",
                    ExceptionDetails: error
                });
                return null;
            }
        }
        return appInsights;
    };

    const aiLogger: IChatSDKLogger = {
        log: (logLevel: LogLevel, telemetryInput: TelemetryInput): void => {
            try {
                const eventName = telemetryInput?.payload?.Event;
                const telemetryInfo = telemetryInput?.telemetryInfo?.telemetryInfo;
                const eventProperties = setEventProperties(telemetryInfo);

                const _logger = logger();
                if (!_logger) return;

                if (telemetryInput.payload.LogToAppInsights === true && eventName) {
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
            const allowedKeys = ["LogLevel", "Description", "ExceptionDetails", "ChannelId", "LCWRuntimeId", "ConversationId", "ChatId"];
    
            allowedKeys.forEach((key) => {
                const value = telemetryInfo[key];
                if (value !== undefined && value !== null && value !== "") {
                    eventProperties[key] = value;
                }
            });
        }
        return eventProperties;
    }

    function getTrackingEventName(logLevel: LogLevel, eventName: string): string {
        if (logLevel === LogLevel.ERROR) {
            return ScenarioMarker.failScenario(eventName);
        }
        if (eventName?.toLowerCase().includes("complete")) {
            return ScenarioMarker.completeScenario(eventName);
        }
        return ScenarioMarker.startScenario(eventName);
    }

    return aiLogger;
};


export interface ICustomProperties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}


export enum AppInsightsTelemetryKey {
    LogLevel = "LogLevel",
    Description = "Description",
    ExceptionDetails = "ExceptionDetails",
    ChannelId = "ChannelId",
    LCWRuntimeId = "LCWRuntimeId",
    ConversationId = "ConversationId",
}