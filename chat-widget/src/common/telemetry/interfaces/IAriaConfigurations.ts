export interface IAriaConfigurations {
    /**
    * Collection uri key for telemetry. Indicates which endpoint to use to post telemetry data
    */
    collectorUriForTelemetry?: string;
    /**
    * Telemetry key to use for logging
    */
    ariaTelemetryKey?: string;
    /**
    * Telemetry application name
    */
    ariaTelemetryApplicationName?: string;
    /**
    * Disable cookie usage
    */
    disableCookieUsage?: boolean;
}