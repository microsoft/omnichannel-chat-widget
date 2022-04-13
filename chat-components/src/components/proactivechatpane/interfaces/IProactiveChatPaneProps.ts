import { IProactiveChatPaneComponentOverrides } from "./IProactiveChatPaneComponentOverrides";
import { IProactiveChatPaneControlProps } from "./IProactiveChatPaneControlProps";
import { IProactiveChatPaneStyleProps } from "./IProactiveChatPaneStyleProps";

export interface IProactiveChatPaneProps {
    componentOverrides?: IProactiveChatPaneComponentOverrides;
    controlProps?: IProactiveChatPaneControlProps;
    styleProps?: IProactiveChatPaneStyleProps;
}