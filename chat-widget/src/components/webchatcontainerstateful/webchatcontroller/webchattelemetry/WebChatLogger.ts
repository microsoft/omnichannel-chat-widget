import { LogLevel } from "../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../common/telemetry/TelemetryHelper";

export function createWebChatTelemetry() {
    const handleTelemetry = (event: any) => {
        const { level } = event;
        const loglevel = level ? level.toUpperCase() : "";

        switch (loglevel) {
        case LogLevel.DEBUG:
            TelemetryHelper.logWebChatEvent(LogLevel.DEBUG, event);
            break;
        case LogLevel.WARN:
            TelemetryHelper.logWebChatEvent(LogLevel.WARN, event);
            break;
        case LogLevel.ERROR:
            TelemetryHelper.logWebChatEvent(LogLevel.ERROR, event);
            break;
        case LogLevel.INFO:
        default:
            TelemetryHelper.logWebChatEvent(LogLevel.INFO, event);
            break;
        }
    };

    return handleTelemetry;
}
