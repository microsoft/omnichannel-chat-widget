import { Constants } from "../../Constants";
import { LogLevel, TelemetryInput } from "../TelemetryConstants";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";

export const consoleLogger = (): IChatSDKLogger => {
    const consoleLogger: IChatSDKLogger = {
        log: (logLevel: LogLevel, telemetryInput: TelemetryInput): void => {
            const payload = telemetryInput?.payload &&
                Object.keys(telemetryInput?.payload).length > 0 ? telemetryInput?.payload : "";
            const telemetryInfo = telemetryInput?.telemetryInfo &&
                Object.keys(telemetryInput?.telemetryInfo).length > 0 ? telemetryInput?.telemetryInfo : "";

            try {
                switch (logLevel) {
                    case LogLevel.INFO:
                        console.info(Constants.LiveChatWidget, payload, telemetryInfo);
                        break;
                    case LogLevel.DEBUG:
                        console.debug(Constants.LiveChatWidget, payload, telemetryInfo);
                        break;
                    case LogLevel.WARN:
                        console.warn(Constants.LiveChatWidget, payload, telemetryInfo);
                        break;
                    case LogLevel.ERROR:
                        console.error(Constants.LiveChatWidget, payload, telemetryInfo);
                        break;
                    default:
                        console.debug(Constants.LiveChatWidget, payload, telemetryInfo);
                        break;
                }
            }
            catch (ex) {
                console.error("An unexpected error occurred in the Telemetry client: " + ex);
            }
        },
        dispose: (): void => {
            console.log("disposing loggers");
        }
    };
    return consoleLogger;
};