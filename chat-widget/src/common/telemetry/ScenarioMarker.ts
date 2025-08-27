enum ScenarioState {
  Start = "STARTED",
  Fail = "FAILED",
  Complete = "COMPLETED",
  Warn = "WARN"
}

function formatScenario(state: ScenarioState, event: string): string {
    return `SCENARIO_${state}: Scenario_${event}`;
}

class ScenarioMarker {
    /**
   * Formats the event name for the "Started" state of a scenario.
   */
    public static startScenario(event: string): string {
        return formatScenario(ScenarioState.Start, event);
    }

    /**
   * Formats the event name for the "Failed" state of a scenario.
   */
    public static failScenario(event: string): string {
        return formatScenario(ScenarioState.Fail, event);
    }

    /**
   * Formats the event name for the "Completed" state of a scenario.
   */
    public static completeScenario(event: string): string {
        return formatScenario(ScenarioState.Complete, event);
    }

    /**
   * Formats the event name for the "Warn" state of a scenario.
   */
    public static warnScenario(event: string): string {
        return formatScenario(ScenarioState.Warn, event);
    }
}

export default ScenarioMarker;