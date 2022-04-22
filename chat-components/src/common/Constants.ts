/* CSS Constants */
export const AccessibilityBrightnessRatio = 1.2;

/* App constants*/
export const BROADCAST_CHANNEL_NAME = "omnichannel_broadcast_channel";

export const KeyCodes = class {
    public static readonly ENTER = "Enter";
    public static readonly ESCAPE = "Escape";
    public static readonly SPACE = "Space";
};

export const Regex = class {
    public static readonly EmailRegex = "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";
    // eslint-disable-next-line
    public static readonly URLRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
};

export enum ElementType {
    ChatButton = "ChatButton",
    HeaderCloseButton = "HeaderCloseButton",
    HeaderMinimizeButton = "HeaderMinimizeButton",
    FooterDownloadTranscriptButton = "FooterDownloadTranscriptButton",
    FooterEmailTranscriptButton = "FooterEmailTranscriptButton",
    FooterSoundNotificationButton = "FooterSoundNotificationButton",
    ReconnectChatContinueChatButton = "ReconnectChatContinueChatButton",
    ReconnectChatStartNewChatButton = "ReconnectChatStartNewChatButton",
    ReconnectChatPane = "ReconnectChatPane",
    ConfirmationPaneConfirmButton = "ConfirmationPaneConfirmButton",
    ConfirmationPaneCancelButton = "ConfirmationPaneCancelButton",
    PreChatSurveySubmitButton = "PreChatSurveySubmitButton",
    PreChatSurveyError = "PreChatSurveyError",
    IncomingCallDeclineCallButton = "IncomingCallDeclineCallButton",
    IncomingCallVideoCallButton = "IncomingCallVideoCallButton",
    IncomingCallAudioCallButton = "IncomingCallAudioCallButton",
    CurrentCallVideoButton = "CurrentCallVideoButton",
    CurrentCallMicButton = "CurrentCallMicButton",
    CurrentCallEndCallButton = "CurrentCallEndCallButton",
    Utility = "Utility",
    Custom = "Custom"
}