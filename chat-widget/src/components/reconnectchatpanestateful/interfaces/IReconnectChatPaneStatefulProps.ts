import { IReconnectChatPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/reconnectchatpane/interfaces/IReconnectChatPaneProps";

export interface IReconnectChatPaneStatefulProps extends IReconnectChatPaneProps {
    reconnectId?: string;
    redirectInSameWindow?: boolean;
}