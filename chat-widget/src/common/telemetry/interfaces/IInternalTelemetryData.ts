import { IAriaConfigurations } from "./IAriaConfigurations";
import { ITelemetryConfig } from "./ITelemetryConfig";

export interface IInternalTelemetryData {
    telemetryConfig?: ITelemetryConfig,
    ariaConfig?: IAriaConfigurations,
    widgetId?: string;
    chatId?: string;
    conversationId?: string;
    currentRequestId?: string;
    OCChatSDKVersion?: string;
    IC3ClientVersion?: string;
    hostName?: string;
    environmentVersion?: string;
    chatWidgetLocaleLCID?: string;
    orgId?: string;
    orgUrl?: string;
    lcwRuntimeId?: string;
    channelId?: string;
    chatWidgetVersion?: string;
    chatComponentVersion?: string;
}