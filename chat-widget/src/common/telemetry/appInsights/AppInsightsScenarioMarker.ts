import { AppInsightsEvent } from "./AppInsightsEvent";

class AppInsightsScenarioMarker {
    /**
   * Formats the event name for the "Started" state of a scenario.
   */
    public static startScenario(event: AppInsightsEvent): string {
        return `SCENARIO_STARTED: Scenario_${event}`;
    }

    /**
   * Formats the event name for the "Failed" state of a scenario.
   */
    public static failScenario(event: AppInsightsEvent): string {
        return `SCENARIO_FAILED: Scenario_${event}`;
    }

    /**
   * Formats the event name for the "Completed" state of a scenario.
   */
    public static completeScenario(event: AppInsightsEvent): string {
        return `SCENARIO_COMPLETED: Scenario_${event}`;
    }

}

export default AppInsightsScenarioMarker;