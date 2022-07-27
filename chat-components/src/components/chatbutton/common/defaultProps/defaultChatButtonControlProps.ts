import { IChatButtonControlProps } from "../../interfaces/IChatButtonControlProps";

export const defaultChatButtonControlProps: IChatButtonControlProps = {
    id: "lcw-components-chat-button",
    dir: "ltr",
    role: "button",
    ariaLabel: "live chat button",
    unreadMessageCount: "0",
    titleText: "Let's Chat!",
    subtitleText: "We're online.",
    onClick: function () {
        console.log("initiate chat"); 
    },
    hideChatButton: false,
    hideChatIcon:false, 
    hideChatTextContainer: false,
    hideChatSubtitle: false,
    hideChatTitle: false,
    hideNotificationBubble: true,
    unreadMessageString: "new messages",
    largeUnreadMessageString: "99+"
};