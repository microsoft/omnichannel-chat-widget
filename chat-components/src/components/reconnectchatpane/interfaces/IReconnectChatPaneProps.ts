import { IReconnectChatPaneComponentOverrides } from "./IReconnectChatPaneComponentOverrides";
import { IReconnectChatPaneControlProps } from "./IReconnectChatPaneControlProps";
import { IReconnectChatPaneStyleProps } from "./IReconnectChatPaneStyleProps";

export interface IReconnectChatPaneProps {
    componentOverrides?: IReconnectChatPaneComponentOverrides;
    controlProps?: IReconnectChatPaneControlProps;
    styleProps?: IReconnectChatPaneStyleProps;
}