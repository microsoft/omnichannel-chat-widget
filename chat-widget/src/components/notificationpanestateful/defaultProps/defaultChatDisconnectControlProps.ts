import { IChatDisconnectControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/chatdisconnect/IChatDisconnectControlProps";
import { NotificationPaneConstants } from "../../../common/Constants";
import { NotificationAlertIcon } from "../../../assets/Icons";

export const defaultChatDisconnectControlProps: IChatDisconnectControlProps = {
    hideTitle: false,
    titleText: NotificationPaneConstants.ChatDisconnectTitleText,
    hideSubtitle: false,
    subtitleText: NotificationPaneConstants.ChatDisconnectSubtitleText,
    hideIcon: false,
    notificationIconProps: {
        id: NotificationPaneConstants.IconId,
        src: NotificationAlertIcon,
        alt: NotificationPaneConstants.IconText,
    },
    hideHyperlink: true,
    hyperlinkText: "Learn more",
    hyperlinkAriaLabel: "Learn more",
    hyperlinkHref: "https://www.microsoft.com",
    hideDismissButton: false,
    dismissButtonProps: {
        id: NotificationPaneConstants.DismissId,
        text: NotificationPaneConstants.DismissText,
        type: "icon",
        iconName: NotificationPaneConstants.ChromeCloseIconName,
        ariaLabel: NotificationPaneConstants.DismissAriaLabel,
    },
    hideCloseChatButton: false,
    closeChatButtonProps: {
        id: NotificationPaneConstants.CloseChatId,
        text: NotificationPaneConstants.CloseChatText,
        type: "text",
        iconName: NotificationPaneConstants.ChromeCloseIconName,
        ariaLabel: NotificationPaneConstants.CloseChatAriaLabel,
    }
};