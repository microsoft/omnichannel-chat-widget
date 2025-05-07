import { LogLevel, TelemetryInput } from "../TelemetryConstants";

export interface IChatSDKLogger {
    log: (logLevel: LogLevel, telemetryInput: TelemetryInput) => void;
    dispose: () => void;
}