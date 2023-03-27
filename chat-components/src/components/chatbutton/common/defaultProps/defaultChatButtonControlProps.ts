import { AriaLabels, Ids, Texts } from "../../../../common/Constants";
import { IChatButtonControlProps } from "../../interfaces/IChatButtonControlProps";

export const defaultChatButtonControlProps: IChatButtonControlProps = {
    id: Ids.DefaultChatButtonId,
    dir: "ltr",
    role: "button",
    ariaLabel: AriaLabels.LetsChatWeAreOnline,
    unreadMessageCount: "0",
    titleText: Texts.ChatButtonTitle,
    subtitleText: Texts.ChatButtonSubtitle,
    onClick: function () {
        console.log("initiate chat"); 
    },
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