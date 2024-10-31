export class Constants {
    public static readonly magicCodeBroadcastChannel = "MagicCodeChannel";
    public static readonly magicCodeResponseBroadcastChannel = "MagicCodeResponseChannel";
    public static readonly systemMessageTag = "system";
    public static readonly userMessageTag = "user";
    public static readonly historyMessageTag = "history";
    public static readonly agentEndConversationMessageTag = "agentendconversation";
    public static readonly supervisorForceCloseMessageTag = "supervisorforceclosedconversation";

    public static readonly receivedMessageClassName = "ms_lcw_webchat_received_message";
    public static readonly sentMessageClassName = "ms_lcw_webchat_sent_message";
    public static readonly webchatChannelId = "webchat";
    public static readonly markdown = "markdown";
    public static readonly actionType = "actionType";

    public static readonly markDownSystemMessageClass = "webchat__basic-transcript__activity-markdown-body";

    public static readonly String = "string";
    public static readonly ChatMessagesJson = "chatMessagesJson";
    public static readonly truePascal = "True";
    public static readonly true = "true";
    public static readonly false = "false";
    public static readonly maximumUnreadMessageCount = 99;

    public static readonly userParticipantTypeTag = "User";
    public static readonly botParticipantTypeTag = "Bot";

    // channelDataMiddleware
    public static readonly channelIdKey = "ChannelId-";
    public static readonly ChannelId = "lcw";
    public static readonly CustomerTag = "FromCustomer";

    // gifUploadMiddleware
    public static readonly GifContentType = "image/gif";

    // htmlPlayerMiddleware
    public static readonly video = "video";
    public static readonly audio = "audio";
    public static readonly controlsList = "controlsList";
    public static readonly nodownload = "nodownload";

    // htmlTextMiddleware
    public static readonly activity = "activity";
    public static readonly payload = "payload";
    public static readonly text = "text";
    public static readonly blank = "_blank";

    // activityMiddleware
    public static readonly visitorIdPrefix = "8:";
    public static readonly left = "left";
    public static readonly queuePositionMessageTag = "queueposition";
    public static readonly averageWaitTimeMessageTag = "averagewaittime";
    public static readonly message = "message";
    public static readonly hiddenTag = "Hidden";

    // messageTimestampMiddleware
    public static readonly prefixTimestampTag = "ServerMessageTimestamp_";
    public static readonly acsChannel = "ACS_CHANNEL";
    public static readonly publicMessageTag = "public";

    //attachmentMiddleware
    public static readonly supportedAdaptiveCardContentTypes: Array<string> = [
        "application/vnd.microsoft.card.adaptive",
        "application/vnd.microsoft.card.audio",
        "application/vnd.microsoft.card.hero",
        "application/vnd.microsoft.card.receipt",
        "application/vnd.microsoft.card.thumbnail",
        "application/vnd.microsoft.card.signin",
        "application/vnd.microsoft.card.oauth",
        "application/vnd.microsoft.card.video"
    ];
    public static readonly adaptiveCardContentTypePrefix = "application/vnd.microsoft.card";
    public static readonly maxUploadFileSize = "500000";
    public static readonly imageRegex = /(\.)(jpeg|jpg|jiff|png|gif|bmp|webp)$/i;
    public static readonly audioMediaRegex = /(\.)(aac|aiff|alac|amr|flac|mp2|mp3|pcm|wav|wma)$/i;
    public static readonly videoMediaRegex = /(\.)(avchd|avi|flv|mpe|mpeg|mpg|mpv|mp4|m4p|m4v|mov|qt|swf|webm|wmv)$/i;
    public static readonly chromeSupportedInlineMediaRegex = /(\.)(aac|mp3|wav|mp4)$/i;
    public static readonly firefoxSupportedInlineMediaRegex = /(\.)(aac|flac|mp3|wav|mp4|mov)$/i;

    // calling container event names
    public static readonly CallAdded = "callAdded";
    public static readonly LocalVideoStreamAdded = "localVideoStreamAdded";
    public static readonly LocalVideoStreamRemoved = "localVideoStreamRemoved";
    public static readonly RemoteVideoStreamAdded = "remoteVideoStreamAdded";
    public static readonly RemoteVideoStreamRemoved = "remoteVideoStreamRemoved";
    public static readonly CallDisconnected = "callDisconnected";
    public static readonly IncomingCallEnded = "incomingCallEnded";
    public static readonly VoiceVideoInitialize = "voiceVideoInitialize";
    public static readonly VoiceVideoInitializeException = "voiceVideoInitializeOnException";
    public static readonly VoiceVideoLoading = "voiceVideoLoading";
    public static readonly VoiceVideoNotLoaded = "voiceVideoNotLoaded";
    public static readonly VoiceVideoLoadingException = "voiceVideoLoadingOnException";
    public static readonly VoiceVideoAcceptCallException = "voiceVideoAcceptCallOnException";
    public static readonly VoiceVideoAcceptCallWithVideoException = "voiceVideoAcceptCallWithVideoException";

    // download transcript
    public static readonly defaultDownloadTranscriptError = "Download transcript failed.";

    // proactive chat
    public static readonly ProactiveChatInviteTimeoutInMs = 60000; // 1 minute

    // prechat survey
    public static readonly InputSubmit = "InputSubmit";

    // reconnect chat
    public static readonly ReconnectIdAttributeName = "oc.reconnectid";

    public static readonly LiveChatWidget = "LiveChatWidgetNew";
    public static readonly GuidPattern = "xx-x-4m-ym-xxx";

    // Markdown plugin
    public static readonly Default = "default";
    public static readonly Zero = "zero";
    public static readonly Title = "title";
    public static readonly Target = "target";
    public static readonly Blank = "_blank";
    public static readonly TargetRelationship = "rel";
    public static readonly TargetRelationshipAttributes = "noopener noreferrer";

    // Markdown icons
    public static readonly OpenLinkIconCssClass = "webchat__render-markdown__external-link-icon";

    // internet connection test
    public static readonly internetConnectionTestUrl = "https://ocsdk-prod.azureedge.net/public/connecttest.txt";
    public static readonly internetConnectionTestUrlText = "Omnichannel Connect Test";

    public static readonly ChatWidgetStateChangedPrefix = "ChatWidgetStateChanged";
    public static readonly PostChatLoadingDurationInMs = 2000;
    public static readonly BrowserUnloadConfirmationMessage = "Do you want to leave chat?";
    public static readonly CacheTtlInMinutes = 15;
    public static readonly SessionCacheSuffix = "session";
    public static readonly PopoutCacheSuffix = "popout";

    // Visibility timeout for conversation details
    public static readonly LWICheckOnVisibilityTimeout = 3 * 60 * 1000; // 3 minute

    // Popup mode custom context response event message name
    public static readonly InitContextParamsRequest = "initContextParamsRequest";
    public static readonly InitContextParamsResponse = "initContextParamsResponse";

    public static readonly OCOriginalMessageId = "OriginalMessageId";
    public static readonly WebchatSequenceIdAttribute = "webchat:sequence-id";
    public static readonly MessageSequenceIdOverride = "MessageSequenceIdOverride";
}

export const Regex = class {
    public static readonly EmailRegex = "(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])";
};

export class HtmlIdNames {
    public static readonly MSLiveChatWidget = "MSLiveChatWidget";
}

export class HtmlClassNames {
    public static readonly webChatBannerCloseButton = "webchat__toast__dismissButton";
    public static readonly webChatBannerExpandButton = "webchat__toaster__expandIcon";
}

export class HtmlElementSelectors {
    public static readonly sendBoxSelector = "textarea[data-id=\"webchat-sendbox-input\"]"
}

export class HtmlAttributeNames {
    public static readonly role = "role";
    public static readonly navigation = "navigation";
    public static readonly ariaLabel = "aria-label";
    public static readonly ariaLive = "aria-live";
    public static readonly ariaDisabled = "aria-disabled";
    public static readonly form = "form";
    public static readonly ariaLabelledby = "aria-labelledby";
    public static readonly tabindex = "tabindex";
    public static readonly ariaRequired = "aria-required";
    public static readonly ariaDesribedby = "aria-describedby";
    public static readonly ariaHidden = "aria-hidden";
    public static readonly disabled = "disabled";
    public static readonly hidden = "hidden";
    public static readonly download = "download";
    public static readonly href = "href";
    public static readonly region = "region";
    public static readonly button = "button";
    public static readonly input = "Input";
    public static readonly style = "style";
    public static readonly head = "head";
    public static readonly type = "type";
    public static readonly csstext = "text/css";
    public static readonly listItem = "LI";
    public static readonly unorderedList = "UL";
    public static readonly div = "div";
    public static readonly aTagName = "a";
    public static readonly pTagName = "p";
    public static readonly noopenerTag = "noopener";
    public static readonly noreferrerTag = "noreferrer";
    public static readonly adaptiveCardClassName = "ac-adaptiveCard";
    public static readonly adaptiveCardTextBlockClassName = "ac-textBlock";
    public static readonly adaptiveCardToggleInputClassName = "ac-toggleInput";
    public static readonly adaptiveCardActionSetClassName = "ac-actionSet";
}

export class WebChatMiddlewareConstants {
    public static readonly nextVisibleActivity = "nextVisibleActivity";
    public static readonly timeBetweenTimestampGroups = 300000; //5 minutes
    public static readonly maxTextLength = 6000;
    public static readonly adaptiveCard = "AdaptiveCard";
}

export class AMSConstants {
    public static readonly supportedImagesMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/heic", "image/webp"];
    public static readonly maxSupportedImageSize = 20; // AMS max file limit outside of supported Images MIME Types.
    public static readonly maxSupportedFileSize = 300; // AMS max size limit.
}

export class MimeTypes {
    public static readonly UnknownFileType = "application/octet-stream";
}

export class LocaleConstants {
    public static readonly RTL_LOCALES = [
        "1025",
        "1037"
    ];
}

export enum ElementType {
    CallingContainerSDK = "CallingContainerSDK"
}

export enum EnvironmentVersion {
    prod = "prod",
    dogfood = "df",
    int = "int",
    test = "test"
}

export enum E2VVOptions {
    NoCalling = "192350000",
    VideoAndVoiceCalling = "192350001",
    VoiceOnly = "192350002"
}

export enum ConversationMode {
    Regular = "192350000",
    Persistent = "192350001"
}

export enum LiveWorkItemState {
    Active = "Active",
    Closed = "Closed",
    Open = "Open",
    Waiting = "Waiting",
    WrapUp = "WrapUp"
}

export enum StorageType {
    "localStorage",
    "sessionStorage"
}

export enum ParticipantType {
    User = "User",
    Bot = "Bot"
}

export enum ConversationEndEntity {
    Customer = "Customer",
    Agent = "Agent", // Currently covers both for human agent and bot
    Bot = "Bot",
    NotSet = "NotSet"
}

export enum ConfirmationState {
    Ok = "Ok",
    Cancel = "Cancel",
    NotSet = "NotSet"
}

export class TranscriptConstants {
    public static readonly ChatTranscriptsBodyColor = "#F5F5F5";
    public static readonly TranscriptMessageEmojiMessageType = "http://schema.skype.com/emoji";
    public static readonly ChatTranscriptDownloadFile = "ChatTranscripts.html";
    public static readonly DefaultFileAttachmentName = "Untitled.txt";
    public static readonly CustomerDialogColor = "#E8E8E8";
    public static readonly CustomerFontColor = "black";
    public static readonly AdaptiveCardType = "adaptivecard";
    public static readonly InternalMode = "internal";
    public static readonly AgentDialogColor = "#2266E3";
    public static readonly AgentFontColor = "white";
}

export class NotificationPaneConstants {
    public static readonly DefaultNotificationPaneId = "lcw-notification-pane";
    public static readonly DismissId = "lcw-notification-pane-dismiss-button";
    public static readonly DismissText = "Dismiss";
    public static readonly DismissAriaLabel = "Notification dismiss";
    public static readonly CloseChatId = "lcw-notification-pane-close-chat-button";
    public static readonly CloseChatText = "Close Chat";
    public static readonly CloseChatAriaLabel = "Close chat";
    public static readonly IconId = "lcw-notification-pane-icon";
    public static readonly IconText = "Notification Icon";
    public static readonly ChatDisconnectTitleText = "Chat disconnected";
    public static readonly ChatDisconnectSubtitleText = "For additional assistance, please close the chat and try again.";
    public static readonly ChromeCloseIconName = "ChromeClose";
}

export class StartChatErrorPaneConstants {
    public static readonly DefaultStartChatErrorPaneId = "oc-lcw-start-chat-error-pane";
    public static readonly DefaultStartChatErrorTitleText = "We are unable to load chat at this time.";
    public static readonly DefaultStartChatErrorSubtitleText = "Please try again later.";
    public static readonly DefaultStartChatErrorUnauthorizedTitleText = "Chat authentication has failed.";
    public static readonly DefaultStartChatErrorAuthSetupErrorTitleText = "Chat authentication has failed.";
    public static readonly DefaultStartChatErrorUnauthorizedSubtitleText = "UNAUTHORIZED";
    public static readonly DefaultStartChatErrorAuthSetupErrorSubtitleText = "AUTH SETUP ERROR";
}

export class AriaTelemetryConstants {
    // Aria Endpoint for different environment types.
    public static readonly GERMANY_ENDPOINT: string = "https://de.pipe.aria.microsoft.com/Collector/3.0/";
    public static readonly GCCH_ENDPOINT: string = "https://tb.pipe.aria.microsoft.com/Collector/3.0/";
    public static readonly DOD_ENDPOINT: string = "https://pf.pipe.aria.microsoft.com/Collector/3.0";
    public static readonly EUROPE_ENDPOINT: string = "https://eu-mobile.events.data.microsoft.com/Collector/3.0/"; // EUDB Collector URL
    public static readonly MOONCAKE_ENDPOINT: string = ""; // Add MoonCake ARIA Endpoint whenever available

    // Environment types
    public static readonly Public: string = "Public";
    public static readonly EU: string = "Europe";

    // EUR: crm4; FRA: crm12; GER: crm16; CHE: crm17; NOR: crm19
    public static readonly lcwEUDomainNames: Array<string> = [
        "crm4.omnichannelengagementhub.com",
        "crm12.omnichannelengagementhub.com",
        "crm16.omnichannelengagementhub.com",
        "crm17.omnichannelengagementhub.com",
        "crm19.omnichannelengagementhub.com"
    ];
}

export class WidgetLoadTelemetryMessage {
    public static readonly OOOHMessage = "Widget is OOOH";
    public static readonly PersistedStateRetrievedMessage = "Persisted state retrieved";
}

export class WidgetLoadCustomErrorString {
    public static readonly AuthenticationFailedErrorString = "Authentication was not successful";
    public static readonly NetworkErrorString = "Network Error";
    public static readonly CloseAdapterAfterDisconnectionErrorString = "Error trying to end/close chat adapter after the widget is back on-line, for an already disconnected session";
}

export class PrepareEndChatDescriptionConstants {
    public static readonly ConversationEndedByCustomerWithoutPostChat = "Conversation ended by customer. Post chat not configured or should not show.";
    public static readonly ConversationEndedByCustomerWithInvalidPostChat = "Conversation ended by customer. Post chat context is invalid.";
    public static readonly ConversationEndedBy = "Conversation ended by";
    public static readonly PrepareEndChatError = "There's an error while preparing to end chat. Closing chat widget.";
    public static readonly WidgetLoadFailedAfterSessionInit = "SessionInit was successful, but widget load failed. Ending chat to avoid ghost chats in OC.";
    public static readonly InitiateEndChatReceived = "Received InitiateEndChat BroadcastEvent while conversation state is not Active. Ending chat.";
    public static readonly EndChatReceivedFromOtherTabs = "Received EndChat BroadcastEvent from other tabs. Closing this chat.";
    public static readonly CustomerCloseChatOnFailureOrPostChat = "Customer is trying to close chat widget on start chat failure or post chat pane.";
    public static readonly CustomerCloseInactiveChat = "Chat was Inactive and customer is trying to close chat widget or refreshing the page.";
    public static readonly BrowserUnload = "Browser unload event received. Ending chat.";
}

export class PostChatSurveyTelemetryMessage {
    public static readonly PostChatContextCallFailed = "Failed to get post chat context.";
    public static readonly PostChatContextCallSucceed = "Postchat context call succeed.";
}