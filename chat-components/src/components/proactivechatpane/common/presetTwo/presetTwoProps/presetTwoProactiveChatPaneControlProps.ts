import { AriaLabels, Texts } from "../../../../../common/Constants";
import { IProactiveChatPaneControlProps } from "../../../interfaces/IProactiveChatPaneControlProps";

export const presetTwoProactiveChatPaneControlProps: IProactiveChatPaneControlProps = {
    id: "lcw-incoming-proactive-chat",
    dir: "ltr",
    hideProactiveChatPane: false,
    proactiveChatPaneAriaLabel: AriaLabels.ProactiveChatPane,

    hideTitle: true,
    titleText: Texts.ProactiveChatPaneTitleText,

    hideSubtitle: false,
    subtitleText: Texts.ProactiveChatPaneSubtitleText,

    hideCloseButton: false,

    isBodyContainerHorizantal: true,

    hideBodyTitle: false,
    
    hideStartButton: false,
    startButtonText: Texts.ProactiveChatPaneStartButtonText,
    startButtonAriaLabel: AriaLabels.ChatNow,

    onStart: function () {
        console.log("on start");
    },
};