import { ActivityMiddleware, ActivityStatusMiddleware, AttachmentForScreenReaderMiddleware, AttachmentMiddleware, AvatarMiddleware, CardActionMiddleware, GroupActivitiesMiddleware, ScrollToEndButtonMiddleware, ToastMiddleware, TypingIndicatorMiddleware, WebSpeechPonyfillFactory } from "botframework-webchat-api";
import { DirectLineActivity, OneOrMany } from "botframework-webchat-core";

import { ReactNode } from "react";

export interface IWebChatProps {
    // "core" props: language-neutral, SHOULD work on React Native (if we work on that later)
    activityMiddleware?: OneOrMany<ActivityMiddleware>;
    activityStatusMiddleware?: OneOrMany<ActivityStatusMiddleware>;
    attachmentForScreenReaderMiddleware?: OneOrMany<AttachmentForScreenReaderMiddleware>;
    attachmentMiddleware?: OneOrMany<AttachmentMiddleware>;
    avatarMiddleware?: OneOrMany<AvatarMiddleware>;
    cardActionMiddleware?: OneOrMany<CardActionMiddleware>;
    children?: ReactNode;
    dir?: string;
    disabled?: boolean;
    downscaleImageToDataURL?: (blob: Blob, maxWidth: number, maxHeight: number, type: string, quality: number) => string;
    grammars?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    groupActivitiesMiddleware?: OneOrMany<GroupActivitiesMiddleware>;
    internalErrorBoxClass?: React.Component | Function; // eslint-disable-line @typescript-eslint/ban-types
    internalRenderErrorBox?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    locale?: string;
    onTelemetry?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    overrideLocalizedStrings?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    renderMarkdown?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    scrollToEndButtonMiddleware?: OneOrMany<ScrollToEndButtonMiddleware>;
    selectVoice?: (voices: typeof window.SpeechSynthesisVoice[], activity: DirectLineActivity) => void;
    sendTypingIndicator?: boolean;
    store?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    toastMiddleware?: OneOrMany<ToastMiddleware>;
    typingIndicatorMiddleware?: OneOrMany<TypingIndicatorMiddleware>;
    userID?: string;
    username?: string;

    // "api" props: these stuff probably only works when in a web browser
    extraStyleSet?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    nonce?: string;
    styleSet?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    suggestedActionsAccessKey?: boolean | string;
    webSpeechPonyfillFactory?: WebSpeechPonyfillFactory;

    // "bundle" props: these stuff are not available if you "decompose" or "recompose" Web Chat.
    //                 I.e. not using composition mode (or <Composer>).
    className?: string;
    role?: "complementary" | "contentinfo" | "form" | "main" | "region";
}