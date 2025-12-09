import * as AC from "adaptivecards";

/**
 * Tool response metadata from OpenAI
 */
export interface ToolResponseMetadata {
  payloadType?: string;
  [key: string]: any;
}

/**
 * OpenAI window API interface
 */
export interface OpenAIWindow extends Window {
  openai?: {
    toolOutput?: Record<string, any>;
    toolResponseMetadata?: ToolResponseMetadata;
    sendFollowUpMessage?: (message: { prompt: string }) => void;
    [key: string]: any;
  };
}

/**
 * Adaptive card JSON structure
 */
export interface AdaptiveCardJson {
  type: string;
  version: string;
  body?: any[];
  actions?: any[];
  [key: string]: any;
}

/**
 * Action handler function type
 */
export type ActionHandler = (
  action: AC.Action,
  setActionResponse: (data: any) => void
) => void;

/**
 * Widget component props
 */
export interface AdaptiveCardRendererProps {
  cardJson: AdaptiveCardJson;
  actionHandler: ActionHandler;
}

/**
 * Widget state
 */
export interface WidgetState {
  cardJson: AdaptiveCardJson | null;
  payloadType: string | null;
  error: string | null;
  isLoading: boolean;
}
