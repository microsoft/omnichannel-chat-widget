// import { IChatDisconnectStyleProps } from "../../interfaces/chatdisconnect/IChatDisconnectStyleProps";
import { IChatDisconnectStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/chatdisconnect/IChatDisconnectStyleProps";

export const defaultChatDisconnectStyleProps: IChatDisconnectStyleProps = {
    generalStyleProps: {
        background: "#315fa2",
        borderRadius: "4px 4px 0 0",
        padding: "5px",
        minHeight: "50px",
        width: "100%",
        minWidth: "250px"
    },
    titleStyleProps: {
        fontSize: 16,
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontWeight: "450",
        color: "white",
        padding: "3px 0"
    },
    subtitleStyleProps: {
        fontSize: 16,
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontWeight: "450",
        color: "white",
        padding: "3px 0"
    },
    dismissButtonStyleProps: {
        color: "white",
        margin: "5px 0",
        fontSize: "12px"
    },
    dismissButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
    notificationIconStyleProps: {
        height: "30px",
        width: "30px",
        margin: "5px 10px"
    },
    closeChatButtonStyleProps: {
        color: "white",
        margin: "5px 0",
        fontSize: "12px"
    },
    closeChatButtonHoverStyleProps: {
        filter: "brightness(0.8)"
    },
};