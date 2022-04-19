import { IAriaConfigurations } from "./IAriaConfigurations";
import { IChatSDKLogger } from "./IChatSDKLogger";

export interface ITelemetryConfig {
    /**
    * Widget app id
    */
    appId?: string;
    /**
    * Widget org id
    */
    orgId?: string;
    /**
    * Widget org url
    */
    orgUrl?: string;
    /**
    * Telemetry disabled
    */
    telemetryDisabled?: boolean;
    /**
    * Disable console logs
    */
    disableConsoleLog?: boolean;
    /**
    * Aria configurations
    */
    ariaConfigurations?: IAriaConfigurations;
    /**
    * custom loggers list
    */
    telemetryLoggers?: IChatSDKLogger[];
}