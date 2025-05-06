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
                const eventProperties: ICustomProperties = {};
                if (telemetryInfo) {
                    const allowedKeys = ["LogLevel", "Description", "ExceptionDetails", "ChannelId", "LCWRuntimeId", "ConversationId"];

                    allowedKeys.forEach((key) => {
                        const value = telemetryInfo[key];
                        if (value !== undefined && value !== null && value !== "") {
                            eventProperties[key] = value;
                        }
                    });
                }
                const _logger = logger();
                if(!_logger) {
                    console.log("Unable to initialize Application Insights logger");
                    return;
                }
                if (telemetryInput.payload.LogToAppInsights === true && eventName?.trim()) {
                    let trackingEventName: string;
                    if (logLevel === LogLevel.ERROR) {
                        trackingEventName = ScenarioMarker.failScenario(eventName);
                    } else if (eventName?.toLowerCase().includes("complete")) {
                        trackingEventName = ScenarioMarker.completeScenario(eventName);
                    } else {
                        trackingEventName = ScenarioMarker.startScenario(eventName);
                    }

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

    return aiLogger;
};


export interface ICustomProperties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
