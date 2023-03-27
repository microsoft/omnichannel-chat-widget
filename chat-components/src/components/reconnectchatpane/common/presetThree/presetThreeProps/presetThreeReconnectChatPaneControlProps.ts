import { AriaLabels, Texts } from "../../../../../common/Constants";
import { IReconnectChatPaneControlProps } from "../../../interfaces/IReconnectChatPaneControlProps";

export const presetThreeReconnectChatPaneControlProps: IReconnectChatPaneControlProps = {
    id: "lcw-components-reconnect-chat-pane",
    dir: "ltr",
    hideReconnectChatPane: false,
    reconnectChatPaneAriaLabel: AriaLabels.ReconnectChatPane,

    hideTitle: false,
    titleText: Texts.ReconnectChatPaneTitleText,

    hideSubtitle: true,
    subtitleText: Texts.ReconnectChatPaneSubtitleText,

    hideIcon: false,
    iconAriaLabel: AriaLabels.ReconnectChatPaneIcon,

    isButtonGroupHorizontal: false,

    hideContinueChatButton: false,
    continueChatButtonText: Texts.ReconnectChatPaneContinueChatButtonText,
    continueChatButtonAriaLabel: AriaLabels.ContinueConversation,

    hideStartNewChatButton: true,
    startNewChatButtonText: Texts.ReconnectChatPaneStartNewChatButtonText,
    startNewChatButtonAriaLabel: AriaLabels.StartNewConversation,

    onContinueChat: function () {
        console.log("on continue conversation");
    },

    onStartNewChat: function () {
        console.log("on start new conversation");
    },
};