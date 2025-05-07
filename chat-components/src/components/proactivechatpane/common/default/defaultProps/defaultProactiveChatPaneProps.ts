import { IProactiveChatPaneProps } from "../../../interfaces/IProactiveChatPaneProps";
import { defaultProactiveChatPaneStyles } from "../defaultStyles/defaultProactiveChatPaneStyles";
import { defaultProactiveChatPaneControlProps } from "./defaultProactiveChatPaneControlProps";

export const defaultProactiveChatPaneProps: IProactiveChatPaneProps = {
    controlProps: defaultProactiveChatPaneControlProps,
    styleProps: defaultProactiveChatPaneStyles
};