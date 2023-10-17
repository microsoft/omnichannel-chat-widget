import { StyleOptions } from "botframework-webchat-api";

export const defaultWebChatStyles: StyleOptions = {
    avatarSize: 32,
    backgroundColor: "#F7F7F9",
    botAvatarBackgroundColor: "#315FA2",
    botAvatarInitials: "WC",
    bubbleBackground: "#315FA2",
    bubbleBorderRadius: 4,
    bubbleBorderWidth: 0,
    bubbleFromUserBackground: "White",
    bubbleFromUserBorderRadius: 4,
    bubbleFromUserBorderWidth: 1,
    bubbleFromUserTextColor: "Black",
    bubbleImageHeight: 240,
    bubbleMaxWidth: 250,
    bubbleMinHeight: 34,
    bubbleMinWidth: 20,
    bubbleTextColor: "White",
    hideSendBox: false,
    hideUploadButton: true,
    primaryFont: "Segoe UI, Arial, sans-serif",
    rootHeight: "100%",
    rootWidth: "100%",
    sendBoxTextWrap: true,
    sendBoxHeight: 60,
    sendBoxMaxHeight: 96,
    sendBoxBackground: "White",
    showAvatarInGroup: true,
    suggestedActionsStackedHeight: 125,
    suggestedActionsStackedOverflow: "scroll" as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    typingAnimationDuration: 3500
};
