import { LogLevel, TelemetryInput } from "../TelemetryConstants";

export interface IChatSDKLogger {
    type?: string;
    log: (logLevel: LogLevel, telemetryInput: TelemetryInput) => void;
    dispose: () => void;
}