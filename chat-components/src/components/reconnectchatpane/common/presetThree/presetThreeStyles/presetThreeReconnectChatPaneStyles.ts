import { IReconnectChatPaneStyleProps } from "../../../interfaces/IReconnectChatPaneStyleProps";
import { presetThreeReconnectChatPaneButtonGroupStyles } from "./presetThreeReconnectChatPaneButtonGroupStyles";
import { presetThreeReconnectChatPaneContinueChatButtonStyles } from "./presetThreeReconnectChatPaneContinueChatButtonStyles";
import { presetThreeReconnectChatPaneGeneralStyles } from "./presetThreeReconnectChatPaneGeneralStyles";
import { presetThreeReconnectChatPaneTitleStyles } from "./presetThreeReconnectChatPaneTitleStyles";
import { presetThreeReconnectChatPaneWrapperStyles } from "./presetThreeReconnectChatPaneWrapperStyles";

export const presetThreeReconnectChatPaneStyles: IReconnectChatPaneStyleProps = {
    generalStyleProps: presetThreeReconnectChatPaneGeneralStyles,
    wrapperStyleProps: presetThreeReconnectChatPaneWrapperStyles,
    titleStyleProps: presetThreeReconnectChatPaneTitleStyles,
    buttonGroupStyleProps: presetThreeReconnectChatPaneButtonGroupStyles,
    continueChatButtonStyleProps: presetThreeReconnectChatPaneContinueChatButtonStyles
};