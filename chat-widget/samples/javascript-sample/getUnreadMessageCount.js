import { BroadcastService } from "@microsoft/omnichannel-chat-components";

export const getUnreadMessageCount = async () => {
    const title = window.document.title;

    BroadcastService.getMessageByEventName("UnreadMessageCount").subscribe((event) => {
        if (event.payload > 0) {
            window.document.title = "(" + event.payload +")" + title;
        } else {
            window.document.title = title;
        }
    });
};