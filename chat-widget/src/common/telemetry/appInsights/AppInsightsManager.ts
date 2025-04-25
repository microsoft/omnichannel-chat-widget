import { ApplicationInsights } from "@microsoft/applicationinsights-web";
import LiveWorkItemDetails from "@microsoft/omnichannel-chat-sdk/lib/core/LiveWorkItemDetails";

export declare interface ICustomProperties {
    [key: string]: string;
}

class AppInsightsManager {
  private static appInsights: ApplicationInsights;
  private static baseProps : IInternalAppInsightsData;

  /**
   * Initializes the App Insights instance with either an Instrumentation Key or a Connection String
   * @param instrumentationKeyOrConnectionString - Either the instrumentation key or connection string for App Insights
   */
  public static initialize(instrumentationKeyOrConnectionString? : string): void {
      console.log("instrumentationKeyOrConnectionString: ", instrumentationKeyOrConnectionString);
      if (!instrumentationKeyOrConnectionString) {
          console.error("Error: Please provide an Instrumentation Key or Connection String");
          return;
      }
      try {
      // Check if the provided string is a connection string or instrumentation key
          if (instrumentationKeyOrConnectionString.includes("IngestionEndpoint")) {
              // connection string
              this.appInsights = new ApplicationInsights({
                  config: {
                      connectionString: instrumentationKeyOrConnectionString,
                  },
              });
          } else {
              //instrumentation key
              this.appInsights = new ApplicationInsights({
                  config: {
                      instrumentationKey: instrumentationKeyOrConnectionString,
                  },
              });
          }
      
          this.appInsights.loadAppInsights();
          console.log("App Insights initialized successfully.");
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
      if (this.appInsights) {
          const eventProps = {
              ...this.baseProps,
              ...properties
          };
          this.appInsights.trackEvent({ name: eventName, properties: eventProps });
          console.log("AppInsightsEvent:", eventName, eventProps);
      } else {
          console.error("App Insights is not initialized.");
      }
  }

  /**
   * Tracks an exception with optional properties.
   * @param exception - The exception to track
   * @param properties - Optional properties with the exception
   */
  public static logError(exception: Error, properties?: ICustomProperties): void {
      if (this.appInsights) {
          const exceptionProps = {
              ...this.baseProps,
              ...properties
          };
          this.appInsights.trackException({ exception }, exceptionProps);
          console.log("AppInsightsException:", exception, exceptionProps);
      } else {
          console.error("App Insights is not initialized.");
      }
  }

  public static addConvDataToAppInsights(liveWorkItem: LiveWorkItemDetails): void {
      this.baseProps = {
          ...this.baseProps,
          conversationId : liveWorkItem?.conversationId
      };
  }

}

export default AppInsightsManager;


export interface IInternalAppInsightsData {
    conversationId?: string,
    channelId?: "lcw",
}
