import { AriaLabels, Ids, Texts } from "../../../../../common/Constants";
import { IReconnectChatPaneControlProps } from "../../../interfaces/IReconnectChatPaneControlProps";

export const defaultReconnectChatPaneControlProps: IReconnectChatPaneControlProps = {
    id: Ids.DefaultReconnectChatPaneId,
    dir: "ltr",
    hideReconnectChatPane: false,
    reconnectChatPaneAriaLabel: AriaLabels.ReconnectChatPane,

    hideTitle: false,
    titleText: Texts.ReconnectChatPaneTitleText,

    hideSubtitle: false,
    subtitleText: Texts.ReconnectChatPaneSubtitleText,

    hideIcon: false,
    iconAriaLabel: AriaLabels.ReconnectChatPaneIcon,

    isButtonGroupHorizontal: false,

    hideContinueChatButton: false,
    continueChatButtonText: Texts.ReconnectChatPaneContinueChatButtonText,
    continueChatButtonAriaLabel: AriaLabels.ContinueConversation,

    hideStartNewChatButton: false,
    startNewChatButtonText: Texts.ReconnectChatPaneStartNewChatButtonText,
    startNewChatButtonAriaLabel: AriaLabels.StartNewConversation,

    onContinueChat: function () {
        console.log("on continue conversation");
    },

    onStartNewChat: function () {
        console.log("on start new conversation");
    },

    onMinimize: function () {
        console.log("on minimize");
    },
};