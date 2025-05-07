import { ITelemetryConfig } from "../interfaces/ITelemetryConfig";
import { defaultAriaConfig } from "./defaultAriaConfig";

export const defaultTelemetryConfiguration: ITelemetryConfig = {
    telemetryDisabled: false,
    disableConsoleLog: false,
    telemetryLoggers: [],
    ariaConfigurations: defaultAriaConfig,
    chatWidgetVersion: "0.0.0-0",
    chatComponentVersion: "0.0.0-0",
    OCChatSDKVersion: "0.0.0-0"
};