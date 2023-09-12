import { IChatDisconnectStyleProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/chatdisconnect/IChatDisconnectStyleProps";

export const defaultChatDisconnectStyleProps: IChatDisconnectStyleProps = {
    generalStyleProps: {
        backgroundColor: "#FFF4CE",
        display: "flex",
    },
    notificationIconStyleProps: {
        display: "flex",
        height: "19px",
        width: "19px",
    },
    notificationIconContainerStyleProps: {
        display: "flex",
        width: "36px",
        height: "32px",
        flexShrink: "0",
        justifyContent: "center",
        alignItems: "center",
    },
    titleStyleProps: {
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "87.5%",
        minHeight: "32px",
        fontWeight: "bold",
    },
    subtitleStyleProps: {
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "87.5%",
        fontWeight: "normal",
    },
    hyperlinkStyleProps: {
        fontFamily: "'Segoe UI', Arial, sans-serif",
        fontSize: "87.5%",
        textDecoration: "none",
        color: "#0078d4",
        fontWeight: "normal",
    },
    hyperlinkHoverStyleProps: {
        textDecoration: "none",
        color: "#005a9e",
    },
    dismissButtonStyleProps: {
        width: "22px",
        height: "22px",
        borderRadius: "3px",
        border: "0",
        margin: "4px",
        backgroundColor: "transparent",
        color: "black",
        icon: {
            fontSize: "14px",
        },
    },
    dismissButtonHoverStyleProps: {
        filter: "brightness(0.8)",
        icon: {
            color: "black"
        }
    },
    closeChatButtonStyleProps: {
        backgroundColor: "white",
        fontFamily: "Segoe UI, Arial, sans-serif",
        fontSize: "87.5%",
        fontWeight: "500",
        height: "32px",
        width: "80px",
        padding: "0px",
    },
    closeChatButtonHoverStyleProps: {
        filter: "brightness(0.8)",
    },
    infoGroupStyleProps: {
        display: "flex",
        justifyContent: "space-between",
        flex: "1 1 0%",
        marginTop: "2px",
    },
    buttonGroupStyleProps: {
        display: "flex",
        justifyContent: "flex-end",
        margin: "8px",
    },
    classNames: {
        containerClassName: "chat-disconnect-container",
        titleClassName: "chat-disconnect-title",
        subtitleClassName: "chat-disconnect-subtitle",
        dismissButtonClassName: "chat-disconnect-dismiss-button",
        hyperlinkClassName: "chat-disconnect-hyperlink",
        notificationIconClassName: "chat-disconnect-notification-icon",
        closeChatButtonClassName: "chat-disconnect-close-chat-button"
    },
};