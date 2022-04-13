import { IReconnectChatPaneControlProps } from "../../../interfaces/IReconnectChatPaneControlProps";

export const presetThreeReconnectChatPaneControlProps: IReconnectChatPaneControlProps = {
    id: "lcw-components-reconnect-chat-pane",
    dir: "ltr",
    hideReconnectChatPane: false,
    reconnectChatPaneAriaLabel: "Reconnect Chat Pane",

    hideTitle: false,
    titleText: "Previous session detected",

    hideSubtitle: true,
    subtitleText: "We have detected a previous chat session. Would you like to continue with your previous session?",

    hideIcon: false,
    iconAriaLabel: "Reconnect Chat Pane Icon",

    isButtonGroupHorizontal: false,

    hideContinueChatButton: false,
    continueChatButtonText: "Continue conversation",
    continueChatButtonAriaLabel: "Continue conversation",

    hideStartNewChatButton: true,
    startNewChatButtonText: "Start new conversation",
    startNewChatButtonAriaLabel: "Start new conversation",

    onContinueChat: function () {
        console.log("on continue conversation");
    },

    onStartNewChat: function () {
        console.log("on start new conversation");
    },
};