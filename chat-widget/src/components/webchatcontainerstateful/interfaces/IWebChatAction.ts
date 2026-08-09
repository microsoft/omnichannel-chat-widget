import type { Middleware } from "redux";

export interface IWebChatAction {
    type: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any;
}

/**
 * Type guard narrowing the `unknown` action received by a Redux 5 store middleware
 * down to Web Chat's IWebChatAction shape, so middlewares can safely access `type`/`payload`.
 */
export const isWebChatAction = (action: unknown): action is IWebChatAction =>
    typeof action === "object" &&
    action !== null &&
    "type" in action &&
    typeof action.type === "string" &&
    Object.prototype.hasOwnProperty.call(action, "payload");

/**
 * Shared middleware type matching the Redux 5 `Middleware` signature expected by
 * botframework-webchat's `createStore`. Use this instead of typing individual
 * middleware `next`/`action` parameters as `any`.
 */
export type WebChatStoreMiddleware = Middleware;
