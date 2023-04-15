import { LogLevel } from "../../../../common/telemetry/TelemetryConstants";
import { TelemetryHelper } from "../../../../common/telemetry/TelemetryHelper";

export function createWebChatTelemetry() {
    let isInitEventLogged = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTelemetry = (event: any) => {
        const { level, name } = event;
        const loglevel = level ? level.toUpperCase() : "";

        if (name?.toLowerCase() === "init" && isInitEventLogged) return;

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

        if (name?.toLowerCase() === "init") {
            isInitEventLogged = true;
        }
    };

    return handleTelemetry;
}
