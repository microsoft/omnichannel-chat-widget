import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";
import { LogLevel, TelemetryEvent, TelemetryInput } from "../TelemetryConstants";
import ScenarioMarker from "../ScenarioMarker";
import { TelemetryHelper } from "../TelemetryHelper";
import { AppInsightsTelemetryMessage } from "../../Constants";
import { AppInsightsEventMapping } from "../AppInsightsEvents";

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        appInsights?: any;
    }
}

enum AllowedKeys {
  LogLevel = "LogLevel",
  Description = "Description",
  ExceptionDetails = "ExceptionDetails",
  ChannelId = "ChannelId",
  LCWRuntimeId = "ClientSessionId",
  ConversationId = "LiveWorkItemId",
  ChatId = "ChatThreadId",
  OrganizationId = "OrganizationId",
  ElapsedTimeInMilliseconds = "DurationInMilliseconds"
}

let initializationPromise: Promise<void> | null = null;

export const appInsightsLogger = (appInsightsKey: string): IChatSDKLogger => {

    const isValidKey = (key: string): boolean => {
        const INSTRUMENTATION_KEY_PATTERN = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
        const INSTRUMENTATION_KEY_REGEX = new RegExp(`^${INSTRUMENTATION_KEY_PATTERN}$`);
        const CONNECTION_STRING_REGEX = new RegExp(
            `^InstrumentationKey=${INSTRUMENTATION_KEY_PATTERN};IngestionEndpoint=https://[a-zA-Z0-9\\-\\.]+\\.applicationinsights\\.azure\\.com/.*`
        );
        return INSTRUMENTATION_KEY_REGEX.test(key) || CONNECTION_STRING_REGEX.test(key);
    };

    const initializeAppInsights = async (appInsightsKey: string) => {
        if (!window.appInsights && appInsightsKey) {
            if (!isValidKey(appInsightsKey)) {
                TelemetryHelper.logActionEvent(LogLevel.ERROR, {
                    Event: TelemetryEvent.AppInsightsInitFailed,
                    Description: AppInsightsTelemetryMessage.AppInsightsKeyError,
                    ExceptionDetails: {
                        message: AppInsightsTelemetryMessage.AppInsightsKeyError
                    }
                });
                return;
            }
            try {
                // Dynamically import Application Insights
                const { ApplicationInsights } = await import("@microsoft/applicationinsights-web");

                const config = {
                    ...appInsightsKey.includes("IngestionEndpoint") ? { connectionString: appInsightsKey } : { instrumentationKey: appInsightsKey }
                };

                // Initialize Application Insights instance
                window.appInsights = new ApplicationInsights({ config });
                window.appInsights.loadAppInsights();
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
            }
        }
    };
    const logger = async () => {
        if (!initializationPromise) {
            initializationPromise = initializeAppInsights(appInsightsKey);
        }
        await initializationPromise;
        return window.appInsights;
    };

    const aiLogger: IChatSDKLogger = {
        type: "appInsightsLogger",
        log: async (logLevel: LogLevel, telemetryInput: TelemetryInput): Promise<void> => {
            try {
                const _logger = await logger();
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
            if (window.appInsights) {
                window.appInsights.unload(); //flush and unload
                window.appInsights = null;
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
        // Rename and Remove "UX" or "LCW" prefix if present
        const event = (AppInsightsEventMapping[eventName] || eventName).replace(/^(UX|LCW)/, "");

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