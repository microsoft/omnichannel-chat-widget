export class Constants {
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

    public static readonly String = "string";
    public static readonly ChatMessagesJson = "chatMessagesJson";
    public static readonly truePascal = "True";
    public static readonly true = "true";
    public static readonly false = "false";
    public static readonly maximumUnreadMessageCount = 99;
    public static readonly widgetStateDataKey = "LcwChatWidgetState";

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

    //attachmentMiddleware
    public static readonly supportedAdaptiveCardContentTypes: Array<string> = [
        "application/vnd.microsoft.card.adaptive",
        "application/vnd.microsoft.card.audio",
        "application/vnd.microsoft.card.hero",
        "application/vnd.microsoft.card.receipt",
        "application/vnd.microsoft.card.thumbnail",
        "application/vnd.microsoft.card.signin",
        "application/vnd.microsoft.card.oauth",
    ];
    public static readonly maxUploadFileSize = "500000";
    public static readonly imageRegex = /(\.)(jpeg|jpg|jiff|png|gif|bmp)$/i;
    public static readonly audioMediaRegex = /(\.)(aac|aiff|alac|flac|mp2|mp3|pcm|wav|wma)$/i;
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
    public static readonly OpenLinkIconCssClass = "webchat__markdown__external-link-icon";

    // internet connection test
    public static readonly internetConnectionTestUrl = "https://ocsdk-prod.azureedge.net/public/connecttest.txt";
    public static readonly internetConnectionTestUrlText = "Omnichannel Connect Test";
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
    public static readonly noopenerTag = "noopener";
    public static readonly noreferrerTag = "noreferrer";
    public static readonly adaptiveCardClassName = "ac-adaptiveCard";
    public static readonly adaptiveCardTextBlockClassName = "ac-textBlock";
    public static readonly adaptiveCardToggleInputClassName = "ac-toggleInput";
}

export class WebChatMiddlewareConstants {
    public static readonly nextVisibleActivity = "nextVisibleActivity";
    public static readonly timeBetweenTimestampGroups = 300000; //5 minutes
    public static readonly maxTextLength = 6000;
    public static readonly adaptiveCard = "AdaptiveCard";
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

export enum ChatSDKError {
    WidgetUseOutsideOperatingHour = "WidgetUseOutsideOperatingHour"
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