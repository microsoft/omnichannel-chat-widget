import { ITelemetryConfig } from "../interfaces/ITelemetryConfig";
import { defaultAriaConfig } from "./defaultAriaConfig";

export const defaultTelemetryConfiguration: ITelemetryConfig = {
    telemetryDisabled: false,
    disableConsoleLog: false,
    telemetryLoggers: [],
    ariaConfigurations: defaultAriaConfig
};