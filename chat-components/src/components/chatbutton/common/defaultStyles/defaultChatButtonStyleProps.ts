import { defaultChatButtonGeneralStyles } from "./defaultChatButtonGeneralStyles";
import { defaultChatButtonIconContainerStyles } from "./defaultChatButtonIconContainerStyles";
import { defaultChatButtonNotificationBubbleStyles } from "./defaultChatButtonNotificationBubbleStyles";
import { IChatButtonStyleProps } from "../../interfaces/IChatButtonStyleProps";
import { defaultChatButtonSubTitleStyles } from "./defaultChatButtonSubTitleStyles";
import { defaultChatButtonTitleStyles } from "./defaultChatButtonTitleStyles";
import { defaultChatButtonTextContainerStyles } from "./defaultChatButtonTextContainerStyles";

export const defaultChatButtonStyleProps: IChatButtonStyleProps = {
    generalStyleProps: defaultChatButtonGeneralStyles,

    // Icon
    iconStyleProps: defaultChatButtonIconContainerStyles,

    //Notification Bubble
    notificationBubbleStyleProps: defaultChatButtonNotificationBubbleStyles,
    
    //Text Container having title and subtitle
    textContainerStyleProps: defaultChatButtonTextContainerStyles,
    titleStyleProps: defaultChatButtonTitleStyles,
    subtitleStyleProps: defaultChatButtonSubTitleStyles
};