export interface IWebChatAction {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
}

/**
 * Type guard narrowing the `unknown` action received by a Redux 5 store middleware
 * down to Web Chat's IWebChatAction shape, so middlewares can safely access `type`/`payload`.
 */
export const isWebChatAction = (action: unknown): action is IWebChatAction =>
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string";

/**
 * Structural middleware type matching the unknown-action contract expected by
 * botframework-webchat's `createStore` without exposing Redux as a public dependency.
 */
type WebChatDispatch = (action: unknown) => unknown;

export type WebChatStoreMiddleware = (api: {
    dispatch: WebChatDispatch;
    getState: () => unknown;
}) => (next: WebChatDispatch) => WebChatDispatch;
