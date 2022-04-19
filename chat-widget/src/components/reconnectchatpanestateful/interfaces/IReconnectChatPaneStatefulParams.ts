import { IReconnectChatPaneStatefulProps } from "./IReconnectChatPaneStatefulProps";

export interface IReconnectChatPaneStatefulParams {
    reconnectChatProps?: IReconnectChatPaneStatefulProps;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initStartChat: (params?: any) => Promise<void>;
}