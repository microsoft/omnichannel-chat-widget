import { IProactiveChatPaneProps } from "../../../interfaces/IProactiveChatPaneProps";
import { presetTwoProactiveChatPaneStyles } from "../presetTwoStyles/presetTwoProactiveChatPaneStyles";
import { presetTwoProactiveChatPaneComponentOverrides } from "./presetTwoProactiveChatPaneComponentOverrides";
import { presetTwoProactiveChatPaneControlProps } from "./presetTwoProactiveChatPaneControlProps";

export const presetTwoProactiveChatPaneProps: IProactiveChatPaneProps = {
    controlProps: presetTwoProactiveChatPaneControlProps,
    styleProps: presetTwoProactiveChatPaneStyles,
    componentOverrides: presetTwoProactiveChatPaneComponentOverrides
};