import { IStartChatErrorPaneComponentOverrides } from "./IStartChatErrorPaneComponentOverrides";
import { IStartChatErrorPaneControlProps } from "./IStartChatErrorPaneControlProps";
import { IStartChatErrorPaneStyleProps } from "./IStartChatErrorPaneStyleProps";

export interface IStartChatErrorPaneProps {
    componentOverrides?: IStartChatErrorPaneComponentOverrides;
    controlProps?: IStartChatErrorPaneControlProps;
    styleProps?: IStartChatErrorPaneStyleProps;
}