import { ApplicationInsights, SeverityLevel } from "@microsoft/applicationinsights-web";
import LiveWorkItemDetails from "@microsoft/omnichannel-chat-sdk/lib/core/LiveWorkItemDetails";
import { TelemetryManager } from "../TelemetryManager";


class AppInsightsManager {
  private static appInsights: ApplicationInsights | null = null;
  private static baseProps : IInternalAppInsightsData = {};

  /**
   * Initializes the App Insights instance with either an Instrumentation Key or a Connection String
   * @param keyOrConnString - Either the instrumentation key or connection string for App Insights
   */
  public static initialize(keyOrConnString? : string): void {
      
      if (this.appInsights || !keyOrConnString) {
          return;
      }
    
      const isConnString = keyOrConnString.includes("IngestionEndpoint");
      try {
          this.appInsights = new ApplicationInsights({
              config: isConnString ? { connectionString: keyOrConnString } : { instrumentationKey: keyOrConnString }
          });
      
          this.appInsights.loadAppInsights();
      } catch (error) {
          console.error("Error initializing App Insights: ", error);
          return;
      }
  }

  /**
   * Tracks a custom event with optional properties.
   * @param eventName - The name of the event to track
   * @param properties - Optional properties with the event
   */
  public static logEvent(eventName: string, properties?: ICustomProperties): void {
      if (!this.appInsights) return;
      const eventProps = this.createCustomProps(SeverityLevel.Information, properties);
      this.appInsights.trackEvent({ name: eventName, properties: eventProps });
  }

  /**
   * Tracks an exception with optional properties.
   * @param exception - The exception to track
   * @param properties - Optional properties with the exception
   */
  public static logError(exception: Error, properties?: ICustomProperties): void {
      if (!this.appInsights) return;
      const exceptionProps = this.createCustomProps(SeverityLevel.Error, properties);
      this.appInsights.trackException({ exception }, exceptionProps);
  }

  private static createCustomProps(severityLevel: SeverityLevel, properties?: ICustomProperties): ICustomProperties {
      return {
          severityLevel,
          channelId: TelemetryManager.InternalTelemetryData?.channelId,
          lcwRuntimeId: TelemetryManager.InternalTelemetryData?.lcwRuntimeId,
          ...this.baseProps,
          ...properties,
      };
  }

  public static addConvDataToAppInsights(liveWorkItem: LiveWorkItemDetails): void {
      this.baseProps = {
          ...this.baseProps,
          conversationId: liveWorkItem?.conversationId,
      };
  }

  public static unloadAppInsights(): void {
      if (this.appInsights) {
          this.appInsights.unload();
          this.appInsights = null;
      } 
  }
}
export default AppInsightsManager;


export interface IInternalAppInsightsData {
    conversationId?: string,
}

export interface ICustomProperties {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
