import { IAttachmentProps } from "./IAttachmentProps";
import React from "react";

export interface IRenderingMiddlewareProps {
    timestampDir?: "ltr" | "rtl" | "auto";
    disableActivityMiddleware?: boolean;
    disableAttachmentMiddleware?: boolean;
    disableActivityStatusMiddleware?: boolean;
    disableAvatarMiddleware?: boolean;
    disableGroupActivitiesMiddleware?: boolean;
    disableTypingIndicatorMiddleware?: boolean;
    disableThirdPartyCookiesAlert?: boolean;
    disableToastMiddleware?: boolean;
    hideSendboxOnConversationEnd?: boolean;

    userMessageStyleProps?: React.CSSProperties;
    systemMessageStyleProps?: React.CSSProperties;
    userMessageBoxStyles?: React.CSSProperties;
    systemMessageBoxStyles?: React.CSSProperties;
    typingIndicatorStyleProps?: React.CSSProperties;
    typingIndicatorBubbleStyleProps?: React.CSSProperties;
    typingIndicatorMessageStyleProps?: React.CSSProperties;
    avatarStyleProps?: React.CSSProperties;
    avatarTextStyleProps?: React.CSSProperties;
    timestampContentStyleProps?: React.CSSProperties;
    timestampFailedTextStyleProps?: React.CSSProperties;
    timestampRetryTextStyleProps?: React.CSSProperties;
    attachmentProps?: IAttachmentProps;
    attachmentDividerStyles?: React.CSSProperties;
    attachmentStyles?: React.CSSProperties;
    attachmentIconStyles?: React.CSSProperties;
    attachmentAdaptiveCardStyles?: React.CSSProperties;
    attachmentFileNameStyles?: React.CSSProperties;
    attachmentDownloadIconStyles?: React.CSSProperties;
    attachmentContentStyles?: React.CSSProperties;
    attachmentSizeStyles?: React.CSSProperties;
    receivedMessageAnchorStyles?: React.CSSProperties;
    sentMessageAnchorStyles?: React.CSSProperties;
}