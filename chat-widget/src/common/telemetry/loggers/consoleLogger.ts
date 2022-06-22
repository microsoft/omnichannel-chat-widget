import { Constants } from "../../Constants";
import { LogLevel, TelemetryInput } from "../TelemetryConstants";
import { IChatSDKLogger } from "../interfaces/IChatSDKLogger";

export const consoleLogger = (): IChatSDKLogger => {
    const consoleLogger: IChatSDKLogger = {
        log: (logLevel: LogLevel, telemetryInput: TelemetryInput): void => {
            const payload = telemetryInput?.payload && 
                Object.keys(telemetryInput?.payload).length > 0 ? telemetryInput?.payload : "";
            const event = telemetryInput?.event && 
            Object.keys(telemetryInput?.event).length > 0 ? telemetryInput?.event : "";

            try {
                switch (logLevel) {
                case LogLevel.INFO:
                    console.info(Constants.LiveChatWidget, payload, event?.eventDetails);
                    break;
                case LogLevel.DEBUG:
                    console.debug(Constants.LiveChatWidget, payload, event?.eventDetails);
                    break;
                case LogLevel.WARN:
                    console.warn(Constants.LiveChatWidget, payload, event?.eventDetails);
                    break;
                case LogLevel.ERROR:
                    console.error(Constants.LiveChatWidget, payload, event?.eventDetails);
                    break;
                default:
                    console.debug(Constants.LiveChatWidget, payload, event?.eventDetails);
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
