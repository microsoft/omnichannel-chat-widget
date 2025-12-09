import * as AC from "adaptivecards";
import { ActionHandler, OpenAIWindow } from "../types";

/**
 * Escalation card action handler
 */
export const handleEscalationCardAction: ActionHandler = (action, setActionResponse) => {
  console.log("[EscalationCardActions] Action executed:", {
    type: action.constructor.name,
    title: action.title,
  });

  if (action instanceof AC.OpenUrlAction) {
    console.log("[EscalationCardActions] Opening URL:", action.url);
    window.open(action.url, "_blank", "noopener,noreferrer");
  } else if (action instanceof AC.SubmitAction) {
    console.log("[EscalationCardActions] Submit data:", action.data);
    setActionResponse(action.data);

    // Optional: Send to OpenAI or backend
    const openaiWindow = window as OpenAIWindow;
    if (openaiWindow.openai?.sendFollowUpMessage) {
      openaiWindow.openai.sendFollowUpMessage({
        prompt: `${JSON.stringify(action.data)}`,
      });
    }
  } else if (action instanceof AC.ShowCardAction) {
    console.log("[EscalationCardActions] Show card action:", action.title);
    // ShowCardAction is handled internally by the Adaptive Cards library
    // The card will automatically expand/collapse
  } else if (action instanceof AC.ToggleVisibilityAction) {
    console.log("[EscalationCardActions] Toggle visibility:", action.targetElements);
    // ToggleVisibilityAction is handled internally by the Adaptive Cards library
  } else if (action instanceof AC.ExecuteAction) {
    console.log("[EscalationCardActions] Execute action:", action.verb, action.data);
    setActionResponse({ verb: action.verb, data: action.data });

    // Optional: Send to OpenAI or backend
    const openaiWindow = window as OpenAIWindow;
    if (openaiWindow.openai?.sendFollowUpMessage) {
      openaiWindow.openai.sendFollowUpMessage({
        prompt: `${JSON.stringify({ verb: action.verb, data: action.data })}`,
      });
    }
  } else {
    console.warn("[EscalationCardActions] Unknown action type:", action.constructor.name);
  }
};
