import { IProactiveChatPaneControlProps } from "../../../interfaces/IProactiveChatPaneControlProps";

export const presetOneProactiveChatPaneControlProps: IProactiveChatPaneControlProps = {
    id: "oclcw-incomingproactivechat",
    dir: "ltr",
    hideProactiveChatPane: false,
    proactiveChatPaneAriaLabel: "Proactive Chat Pane",

    hideTitle: false,
    titleText: "Welcome to",

    hideSubtitle: false,
    subtitleText: "Live chat support!",

    hideCloseButton: false,
    closeButtonProps: {
        type: "icon",
        iconName: "ChromeClose",
        hideButtonTitle: true
    },

    isBodyContainerHorizantal: true,

    hideBodyTitle: false,
    bodyTitleText: "Hi! Have any questions? I am here to help.",

    hideStartButton: false,
    startButtonText: "Chat Now",
    startButtonAriaLabel: "Chat Now",

    onClose: function () {
        console.log("on close");
    },

    onStart: function () {
        console.log("on start");
    },
};