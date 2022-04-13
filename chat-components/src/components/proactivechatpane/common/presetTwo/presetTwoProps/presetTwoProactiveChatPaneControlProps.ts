import { IProactiveChatPaneControlProps } from "../../../interfaces/IProactiveChatPaneControlProps";

export const presetTwoProactiveChatPaneControlProps: IProactiveChatPaneControlProps = {
    id: "oclcw-incomingproactivechat",
    dir: "ltr",
    hideProactiveChatPane: false,
    proactiveChatPaneAriaLabel: "Proactive Chat Pane",

    hideTitle: true,
    titleText: "Welcome to",

    hideSubtitle: false,
    subtitleText: "Live chat support!",

    hideCloseButton: false,

    isBodyContainerHorizantal: true,

    hideBodyTitle: false,
    
    hideStartButton: false,
    startButtonText: "Chat Now",
    startButtonAriaLabel: "Chat Now",

    onStart: function () {
        console.log("on start");
    },
};