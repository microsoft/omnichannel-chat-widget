/* CSS Constants */
export const AccessibilityBrightnessRatio = 1.2;

export const HiddenTextStyles: React.CSSProperties = {
    position: "absolute",
    height: "1px",
    width: "1px",
    overflow: "hidden",
    clip: "rect(1px, 1px, 1px, 1px)",
    whiteSpace: "nowrap"
};

export const KeyCodes = class {
    public static readonly ENTER = "Enter";
    public static readonly ESCAPE = "Escape";
    public static readonly SPACE = "Space";

    // Calling container shortcuts
    public static readonly DeclineCallHotKey = "D";
    public static readonly AcceptAudioCallHotKey = "S";
    public static readonly AcceptVideoCallHotKey = "A";
    public static readonly ToggleMicHotKey = "M";
    public static readonly ToggleCameraHotKey = "O";
    public static readonly EndCallHotKey = "H";
};

export const Regex = class {
    public static readonly EmailRegex = "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";
    // eslint-disable-next-line
    public static readonly URLRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
};

export enum ElementType {
    ChatButton = "ChatButton",
    CloseButton = "CloseButton",
    HeaderMinimizeButton = "HeaderMinimizeButton",
    NotificationDismissButton = "NotificationDismissButton",
    NotificationCloseChatButton = "NotificationCloseChatButton",
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

export const Ids = class {
    public static readonly DefaultCallingContainerId = "lcw-calling-container";
    public static readonly DefaultCurrentCallId = "lcw-current-call-container";
    public static readonly CurrentCallActionGroupId = "lcw-current-call-action-icons";
    public static readonly CurrentCallFooterId = "lcw-current-call-footer";
    public static readonly RemoteVideoTileId = "lcw-remote-video";
    public static readonly SelfVideoTileId = "lcw-self-video";
    public static readonly VideoTileGroupId = "lcw-current-call-body";
    public static readonly EndCallButtonId = "lcw-call-reject-button";
    public static readonly MicButtonId = "lcw-toggle-audio";
    public static readonly VideoButtonId = "lcw-toggle-video";
    public static readonly CallTimerId = "lcw-current-call-timer";
    public static readonly CurrentCallLeftGroupId = "lcw-current-call-left-group";
    public static readonly CurrentCallMiddleGroupId = "lcw-current-call-middle-group";
    public static readonly CurrentCallRightGroupId = "lcw-current-call-right-group";
    public static readonly DefaultIncomingCallId = "lcw-incoming-call";
    public static readonly DeclineCallButtonId = "lcw-call-reject-button";
    public static readonly AudioCallButtonId = "lcw-call-accept-button";
    public static readonly VideoCallButtonId = "lcw-video-call-accept-button";
    public static readonly IncomingCallTitleId = "lcw-incoming-call-message";
    public static readonly DefaultIncomingCallPopupId = "lcw-incoming-call-popup";
    public static readonly IncomingCallLeftGroupId = "lcw-incoming-call-left-group";
    public static readonly IncomingCallMiddleGroupId = "lcw-incoming-call-middle-group";
    public static readonly IncomingCallRightGroupId = "lcw-incoming-call-right-group";
    public static readonly DefaultChatButtonId = "lcw-components-chat-button";
    public static readonly DefaultConfirmationPaneId = "lcw-components-confirmation-pane";
    public static readonly CustomFooterId = "lcw-footer";
    public static readonly DownloadTranscriptButtonId = "lcw-footer-download-transcript-button";
    public static readonly EmailTranscriptButtonId = "lcw-footer-email-transcript-button";
    public static readonly AudioNotificationButtonId = "lcw-footer-audio-notification-button";
    public static readonly DefaultFooterId = "lcw-components-footer";
    public static readonly FooterLeftGroupId = "lcw-footer-left-group";
    public static readonly FooterMiddleGroupId = "lcw-footer-middle-group";
    public static readonly FooterRightGroupId = "lcw-footer-right-group";
    public static readonly DefaultHeaderId = "lcw-header";
    public static readonly MinimizeButtonId = "lcw-header-minimize-button";
    public static readonly CloseButtonId = "lcw-header-close-button";
    public static readonly HeaderIconId = "lcw-header-icon";
    public static readonly HeaderTitleId = "lcw-header-title";
    public static readonly HeaderLeftGroupId = "lcw-header-left-group";
    public static readonly HeaderMiddleGroupId = "lcw-header-middle-group";
    public static readonly HeaderRightGroupId = "lcw-header-right-group";
    public static readonly DefaultInputValidationPaneId = "lcw-email-transcript-dialog-container";
    public static readonly DefaultInputValidationPaneInputId = "lcw-email-transcript-dialog-text-field";
    public static readonly DefaultLoadingPaneId = "lcw-loading-pane";
    public static readonly DefaultNotificationPaneId = "lcw-notification-pane";
    public static readonly DefaultOOOHPaneId = "lcw-out-of-office-hours-pane";
    public static readonly DefaultPostChatSurveyPaneId = "lcw-postchat-survey-pane";
    public static readonly DefaultPreChatSurveyPaneId = "lcw-prechat-survey-pane-default";
    public static readonly DefaultProactiveChatPaneId = "lcw-proactive-chat";
    public static readonly DefaultReconnectChatPaneId = "lcw-reconnect-chat-pane";
};

export const ButtonTypes = class {
    public static readonly Icon = "icon";
    public static readonly Text = "text";
};

export const IconNames = class {
    public static readonly DeclineCall = "DeclineCall";
    public static readonly Microphone = "Microphone";
    public static readonly MicOff2 = "MicOff2";
    public static readonly Video = "Video";
    public static readonly VideoOff = "VideoOff";
    public static readonly IncomingCall = "IncomingCall";
    public static readonly ChromeClose = "ChromeClose";
    public static readonly Download = "Download";
    public static readonly Mail = "Mail";
    public static readonly Volume3 = "Volume3";
    public static readonly Volume0 = "Volume0";
    public static readonly ChromeMinimize = "ChromeMinimize";
};

export const AriaLabels = class {
    public static readonly EndCall = "End Call";
    public static readonly MicMute = "Mute";
    public static readonly MicUnmute = "Unmute";
    public static readonly VideoTurnCameraOn = "Turn camera on";
    public static readonly VideoTurnCameraOff = "Turn camera off";
    public static readonly IncomingCallArea = "Incoming call area";
    public static readonly RejectCall = "Reject call";
    public static readonly AcceptVoiceCall = "Accept voice call";
    public static readonly AcceptVideoCall = "Accept video Call";
    public static readonly DeclineCall = "Decline Call";
    public static readonly AudioCall = "Audio Call";
    public static readonly VideoCall = "Video Call";
    public static readonly LetsChatWeAreOnline = "Let's chat we are online";
    public static readonly UnreadMessageString = "you have new messages";
    public static readonly Close = "Close";
    public static readonly ConfirmationPaneConfirm = "Close Chat";
    public static readonly ConfirmationPaneCancel = "Cancel. Return to Chat";
    public static readonly DownloadChatTranscript = "Download chat transcript";
    public static readonly EmailTranscript = "Email Transcript";
    public static readonly TurnSoundOff = "Turn sound off";
    public static readonly TurnSoundOn = "Turn sound on";
    public static readonly Minimize = "Minimize";
    public static readonly EmailChatTranscriptPane = "Email Chat Transcript Pane";
    public static readonly InputValidationPaneInput = "Please provide e-mail address to send transcript. The transcript will be sent after the chat ends. Email address text area";
    public static readonly Save = "Save";
    public static readonly Cancel = "Cancel";
    public static readonly ProactiveChatPane = "Proactive Chat Pane";
    public static readonly ChatNow = "Chat Now";
    public static readonly ReconnectChatPane = "Reconnect Chat Pane";
    public static readonly ReconnectChatPaneIcon = "Reconnect Chat Pane Icon";
    public static readonly ContinueConversation = "Continue conversation";
    public static readonly StartNewConversation = "Start new conversation";
};

export const EventNames = class {
    public static readonly OnClick = "OnClick";
    public static readonly OnEscapeKeyDown = "OnEscapeKeyDown";
    public static readonly IncomingCallEnded = "IncomingCallEnded";
};

export const Texts = class {
    public static readonly IncomingCallTitle = "Incoming Call";
    public static readonly ChatButtonTitle = "Let's Chat!";
    public static readonly ChatButtonSubtitle = "We're online.";
    public static readonly ChatButtonUnreadMessageString = "new messages";
    public static readonly ChatButtonLargeUnreadMessageString = "99+";
    public static readonly CloseButtonText = "Close";
    public static readonly ConfirmationPaneTitle = "Close chat";
    public static readonly ConfirmationPaneSubtitle = "Do you really want to close this chat?";
    public static readonly ConfirmButtonText = "Close";
    public static readonly EmailPlaceHolderText = "johnsmith@outlook.com";
    public static readonly CancelButtonText = "Cancel";
    public static readonly DownloadChatTranscriptText = "Download chat transcript";
    public static readonly EmailTranscriptText = "Email Transcript";
    public static readonly HeaderIcon = "Chat Icon";
    public static readonly HeaderTitle = "Let's Chat";
    public static readonly MinimizeText = "Minimize";
    public static readonly InputValidationPaneTitleText = "Please provide e-mail address to send transcript.";
    public static readonly InputValidationPaneSubtitleText = "The transcript will be sent after the chat ends.";
    public static readonly InvalidInputErrorMessageText = "Enter a valid email address.";
    public static readonly SendButtonText = "Send";
    public static readonly SaveButtonText = "Save";
    public static readonly LoadingPaneTitleText = "Welcome to";
    public static readonly LoadingPaneSubtitleText = "live chat support ...";
    public static readonly LoadingPaneSpinnerText = "Loading ...";
    public static readonly OOOHPaneTitleText = "Thanks for contacting us. You have reached us outside of our operating hours. An agent will respond when we open.";
    public static readonly PostChatSurveyPaneTitleText = "Post chat survey pane";
    public static readonly ProactiveChatPaneTitleText = "Welcome to";
    public static readonly ProactiveChatPaneSubtitleText = "Live chat support!";
    public static readonly ProactiveChatPaneBodyTitleText = "Hi! Have any questions? I am here to help.";
    public static readonly ProactiveChatPaneStartButtonText = "Chat Now";
    public static readonly ReconnectChatPaneTitleText = "Previous session detected";
    public static readonly ReconnectChatPaneSubtitleText = "We have detected a previous chat session. Would you like to continue with your previous session?";
    public static readonly ReconnectChatPaneContinueChatButtonText = "Continue conversation";
    public static readonly ReconnectChatPaneStartNewChatButtonText = "Start new conversation";
};