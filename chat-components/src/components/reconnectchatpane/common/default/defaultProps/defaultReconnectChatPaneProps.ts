import { IReconnectChatPaneProps } from "../../../interfaces/IReconnectChatPaneProps";
import { defaultReconnectChatPaneStyles } from "../defaultStyles/defaultReconnectChatPaneStyles";
import { defaultReconnectChatPaneControlProps } from "./defaultReconnectChatPaneControlProps";

export const defaultReconnectChatPaneProps: IReconnectChatPaneProps = {
    controlProps: defaultReconnectChatPaneControlProps,
    styleProps: defaultReconnectChatPaneStyles
};