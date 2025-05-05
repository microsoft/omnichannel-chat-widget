import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { LogLevel, TelemetryInput } from "../TelemetryConstants";
import ScenarioMarker from "../ScenarioMarker";



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
            } catch (error) {
                console.error("Error initializing Application Insights: ", error);
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
                
                if (telemetryInput.payload.LogToAppInsights === true) {
                    if (logLevel === LogLevel.ERROR) {
                        logger() ? logger()?.trackEvent({ name: ScenarioMarker.failScenario(eventName ?? ""), properties: eventProperties }) : console.log("Unable to initialize Application Insights logger");
                    } else {
                        if (eventName?.toLowerCase().includes("complete")) {
                            logger() ? logger()?.trackEvent({ name: ScenarioMarker.completeScenario(eventName ?? ""), properties: eventProperties }) : console.log("Unable to initialize Application Insights logger");
                        } else {
                            logger() ? logger()?.trackEvent({ name: ScenarioMarker.startScenario(eventName ?? ""), properties: eventProperties }) : console.log("Unable to initialize Application Insights logger");
                        }
                    }
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
