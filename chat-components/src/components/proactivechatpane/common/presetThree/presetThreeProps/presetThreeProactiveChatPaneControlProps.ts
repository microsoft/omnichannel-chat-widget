import { AriaLabels, ButtonTypes, IconNames, Texts } from "../../../../../common/Constants";
import { IProactiveChatPaneControlProps } from "../../../interfaces/IProactiveChatPaneControlProps";

export const presetThreeProactiveChatPaneControlProps: IProactiveChatPaneControlProps = {
    id: "lcw-incoming-proactive-chat",
    dir: "ltr",
    hideProactiveChatPane: false,
    proactiveChatPaneAriaLabel: AriaLabels.ProactiveChatPane,

    hideTitle: false,
    titleText: Texts.ProactiveChatPaneTitleText,

    hideSubtitle: false,
    subtitleText: Texts.ProactiveChatPaneSubtitleText,

    hideCloseButton: false,
    closeButtonProps: {
        type: ButtonTypes.Icon,
        iconName: IconNames.ChromeClose,
        hideButtonTitle: true
    },

    isBodyContainerHorizantal: false,

    hideBodyTitle: false,
    bodyTitleText: Texts.ProactiveChatPaneBodyTitleText,

    hideStartButton: false,
    startButtonText: Texts.ProactiveChatPaneStartButtonText,
    startButtonAriaLabel: AriaLabels.ChatNow,

    onClose: function () {
        console.log("on close");
    },

    onStart: function () {
        console.log("on start");
    },
};