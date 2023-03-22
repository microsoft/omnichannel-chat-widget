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
    public static readonly DefaultCallingContainerId = "oc-lcw-callingcontainer";
    public static readonly DefaultCurrentCallId = "currentCall-container";
    public static readonly CurrentCallActionGroupId = "currentCall-actionicons";
    public static readonly CurrentCallFooterId = "currentCall-footer";
    public static readonly RemoteVideoTileId = "remoteVideo";
    public static readonly SelfVideoTileId = "selfVideo";
    public static readonly VideoTileGroupId = "currentCall-body";
    public static readonly EndCallButtonId = "callRejectButton";
    public static readonly MicButtonId = "toggleAudio";
    public static readonly VideoButtonId = "toggleVideo";
    public static readonly CallTimerId = "oc-lcw-CurrentCall-timer";
    public static readonly CurrentCallLeftGroupId = "currentCallLeftGroup";
    public static readonly CurrentCallMiddleGroupId = "currentCallMiddleGroup";
    public static readonly CurrentCallRightGroupId = "currentCallRightGroup";
    public static readonly DefaultIncomingCallId = "oc-lcw-incomingcall";
    public static readonly DeclineCallButtonId = "callRejectButton";
    public static readonly AudioCallButtonId = "callAcceptButton";
    public static readonly VideoCallButtonId = "videoCallAcceptButton";
    public static readonly IncomingCallTitleId = "incomingCallMessage";
    public static readonly DefaultIncomingCallPopupId = "incomingCallPopup";
    public static readonly IncomingCallLeftGroupId = "incomingCallLeftGroup";
    public static readonly IncomingCallMiddleGroupId = "incomingCallMiddleGroup";
    public static readonly IncomingCallRightGroupId = "incomingCallRightGroup";
    public static readonly DefaultChatButtonId = "lcw-components-chat-button";
    public static readonly DefaultConfirmationPaneId = "lcw-components-confirmation-pane";
    public static readonly CustomFooterId = "oc-lcw-footer";
    public static readonly DownloadTranscriptButtonId = "oc-lcw-footer-downloadtranscript-button";
    public static readonly EmailTranscriptButtonId = "oc-lcw-footer-emailtranscript-button";
    public static readonly AudioNotificationButtonId = "oc-lcw-footer-audionotification-button";
    public static readonly DefaultFooterId = "lcw-components-footer";
    public static readonly FooterLeftGroupId = "footerLeftGroup";
    public static readonly FooterMiddleGroupId = "footerMiddleGroup";
    public static readonly FooterRightGroupId = "footerRightGroup";
    public static readonly DefaultHeaderId = "oc-lcw-header";
    public static readonly MinimizeButtonId = "oc-lcw-header-minimize-button";
    public static readonly CloseButtonId = "oc-lcw-header-close-button";
    public static readonly HeaderIconId = "oc-lcw-header-icon";
    public static readonly HeaderTitleId = "oc-lcw-header-title";
    public static readonly HeaderLeftGroupId = "headerLeftGroup";
    public static readonly HeaderMiddleGroupId = "headerMiddleGroup";
    public static readonly HeaderRightGroupId = "headerRightGroup";
    public static readonly DefaultInputValidationPaneId = "oclcw-emailTranscriptDialogContainer";
    public static readonly DefaultInputValidationPaneInputId = "oclcw-emailTranscriptDialogTextField";
    public static readonly DefaultLoadingPaneId = "oc-lcw-loadingpane";
    public static readonly DefaultOOOHPaneId = "oc-lcw-outofofficehours-pane";
    public static readonly DefaultPostChatSurveyPaneId = "oc-lcw-postchatsurvey-pane";
    public static readonly DefaultPreChatSurveyPaneId = "oc-lcw-prechatsurveypane-default";
    public static readonly DefaultProactiveChatPaneId = "oc-lcw-proactivechat";
    public static readonly DefaultReconnectChatPaneId = "oc-lcw-reconnectchat-pane";
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
    public static readonly CloseChat = "Close Chat";
    public static readonly CancelReturnToChat = "Cancel. Return to Chat";
    public static readonly DownloadChatTranscript = "Download chat transcript";
    public static readonly EmailTranscript = "Email Transcript";
    public static readonly TurnSoundOff = "Turn sound off";
    public static readonly TurnSoundOn = "Turn sound on";
    public static readonly Minimize = "Minimize";
    public static readonly EmailChatTranscriptPane = "Email Chat Transcript Pane";
    public static readonly InputValidationPaneInput = "Email this chat transcript. This will be sent after your chat ends. Email address text area";
    public static readonly Send = "Send";
    public static readonly Cancel = "Cancel";
    public static readonly ProactiveChatPane = "Proactive Chat Pane";
    public static readonly ChatNow = "Chat Now";
    public static readonly ReconnectChatPane = "Reconnect Chat Pane";
    public static readonly ReconnectChatPaneIcon = "Reconnect Chat Pane Icon";
    public static readonly ContinueConversation = "Continue conversation";
    public static readonly StartNewConversation = "Start new conversation";
};

export const EventNames = class {
    public static readonly onClick = "onClick";
    public static readonly onEscapeKeyDown = "onEscapeKeyDown";
    public static readonly incomingCallEnded = "incomingCallEnded";
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
    public static readonly CancelButtonText = "Cancel";
    public static readonly DownloadChatTranscriptText = "Download chat transcript";
    public static readonly EmailTranscriptText = "Email Transcript";
    public static readonly HeaderIcon = "Chat Icon";
    public static readonly HeaderTitle = "Let's Chat";
    public static readonly MinimizeText = "Minimize";
    public static readonly InputValidationPaneTitleText = "Email this chat transcript";
    public static readonly InputValidationPaneSubtitleText = "This will be sent after your chat ends.";
    public static readonly InvalidInputErrorMessageText = "Enter a valid email address.";
    public static readonly SendButtonText = "Send";
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