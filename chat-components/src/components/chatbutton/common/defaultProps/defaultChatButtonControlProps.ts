import { AriaLabels, Ids, Texts } from "../../../../common/Constants";
import { IChatButtonControlProps } from "../../interfaces/IChatButtonControlProps";

export const defaultChatButtonControlProps: IChatButtonControlProps = {
    id: Ids.DefaultChatButtonId,
    dir: "ltr",
    role: "button",
    unreadMessageCount: "0",
    onClick: function () {
        console.log("initiate chat"); 
    },
    titleText: Texts.ChatButtonTitle,
    subtitleText: Texts.ChatButtonSubtitle,
    hideChatButton: false,
    hideChatIcon:false, 
    hideChatTextContainer: false,
    hideChatSubtitle: false,
    hideChatTitle: false,
    hideNotificationBubble: true,
    unreadMessageString: Texts.ChatButtonUnreadMessageString,
    largeUnreadMessageString: Texts.ChatButtonLargeUnreadMessageString,
    ariaLabelUnreadMessageString: AriaLabels.UnreadMessageString
};