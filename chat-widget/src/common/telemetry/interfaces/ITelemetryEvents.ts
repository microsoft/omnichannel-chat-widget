import { ICustomEvent } from "@microsoft/omnichannel-chat-components/lib/types/interfaces/ICustomEvent";
import { LogLevel } from "../TelemetryConstants";
import { TelemetryData } from "../definitions/Payload";

export interface ITelemetryEvent extends ICustomEvent {
    logLevel: LogLevel,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: TelemetryData | any,
}