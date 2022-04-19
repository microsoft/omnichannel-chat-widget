import { LiveChatWidgetActionType } from "./LiveChatWidgetActionType";

export interface ILiveChatWidgetAction {
    type: LiveChatWidgetActionType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload: any
}