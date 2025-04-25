export enum AppInsightsEvent {
    OCChatConfigError = "OCChatConfigError",
    UXLivechatwidgetLoading = "LivechatWidgetLoading", // started, completed, failed
   
    //chat button
    UXLCWChatButtonStart = "LCWChatButtonStart",
    LCWChatButtonClicked = "LCWChatButtonClicked",
    LCWChatButtonShow = "LCWChatButtonShow", // started, completed
    InMemoryDataStoreFailed = "InMemoryDataStoreFailed",
    ThirdPartyCookiesBlocked = "ThirdPartyCookiesBlocked",
    ClientDataStoreProviderFailed = "ClientDataStoreProviderFailed",
    GetConversationDetailsCall = "GetConversationDetailsCall", // started, failed
    

    //proactive chat
    StartProactiveChatEventReceived = "StartProactiveChatEventReceived",
    IncomingProactiveChatScreenLoaded = "IncomingProactiveChatScreenLoaded",
    UXProactiveChatPaneLoading = "UXProactiveChatPaneLoading", // started, completed
    ProactiveChatRejected = "ProactiveChatRejected",
    ProactiveChatAccepted = "ProactiveChatAccepted",
    ProactiveChatClosed = "ProactiveChatClosed",

    // header
    HeaderMinimizeButtonClicked = "HeaderMinimizeButtonClicked",
    HeaderCloseButtonClicked = "HeaderCloseButtonClicked",
    UXLoadingPaneLoading = "UXLoadingPaneLoading", // started, completed

    // footer
    DownloadTranscriptButtonClicked = "DownloadTranscriptButtonClicked",
    DownloadTranscriptFailed = "DownloadTranscriptFailed",
    EmailTranscriptButtonClicked = "EmailTranscriptButtonClicked",
    AudioToggleButtonClicked = "AudioToggleButtonClicked",

    // start chat error
    UXStartChatErrorPaneLoading = "UXStartChatErrorPaneLoading", // started, completed
    UXOOHPaneLoading = "UXOOHPaneLoading", // started, completed
    ErrorUIPaneLoaded = "ErrorUIPaneLoaded",
    WidgetLoadFailedAfterSessionInit = "WidgetLoadFailedAfterSessionInit",

    // Reconnect
    UXReconnectChatPaneLoading = "UXReconnectChatPaneLoading", // started, completed
    ReconnectChatContinueConversationClicked = "ReconnectChatContinueConversationClicked",
    ReconnectChatStartNewConversationClicked = "ReconnectChatStartNewConversationClicked",
    ReconnectChatMinimize = "ReconnectChatMinimize",

    // pre chat
    UXPrechatPaneLoading = "UXPrechatPaneLoading", // started, completed
    ParseAdaptiveCardFailed = "ParseAdaptiveCardFailed",
    PrechatSubmitted = "PrechatSubmitted",
    PreChatSurveyStartChatMethodFailed = "PreChatSurveyStartChatMethodFailed",


    // startChat
    StartChatEventReceived = "StartChatEventReceived",
    PrechatSurveyExpected = "PrechatSurveyExpected",
    StartChatMethodException = "StartChatMethodException",
    SettingCustomContext = "SettingCustomContext",
    GetConversationDetailsException = "GetConversationDetailsException",

    // network
    NetworkDisconnected = "NetworkDisconnected",
    NetworkReconnected = "NetworkReconnected",

    // auth
    GetAuthTokenCalled = "GetAuthTokenCalled",
    ReceivedNullOrEmptyToken = "ReceivedNullOrEmptyToken",
    NewTokenFailed = "NewTokenFailed",
    NewTokenExpired = "NewTokenExpired",
    NewTokenSuccess = "NewTokenSuccess",

    // webchat
    UXWebchatContainerLoading = "UXWebchatContainerLoading", // started, completed
    SuppressBotMagicCode = "SuppressBotMagicCode", // started, completed, failed

     // message
     MessageSent = "MessageSent",
     SystemMessageReceived = "SystemMessageReceived",
     MessageReceived = "MessageReceived",
     RehydrateMessageReceived = "RehydrateMessageReceived",
     QueuePositionMessageRecieved = "QueuePositionMessageRecieved",
     AverageWaitTimeMessageRecieved = "AverageWaitTimeMessageRecieved",
     HiddenAdaptiveCardMessageReceived = "HiddenAdaptiveCardMessageReceived",
 
     // sanitization/processing
     ProcessingSanitizationMiddlewareFailed = "ProcessingSanitizationMiddlewareFailed",
     ProcessingHTMLTextMiddlewareFailed = "ProcessingHTMLTextMiddlewareFailed",
     FormatTagsMiddlewareJSONStringifyFailed = "FormatTagsMiddlewareJSONStringifyFailed",
 
     // data masking
     DataMaskingRuleApplyFailed = "DataMaskingRuleApplyFailed", 
     DataMaskingRuleApplied = "DataMaskingRuleApplied",
     InvalidConfiguration = "InvalidDataMaskingConfiguration",
 
     // attachments
     AttachmentUploadValidatorMiddlewareFailed = "AttachmentUploadValidatorMiddlewareFailed",

    // email
    UXEmailTranscriptPaneLoading = "UXEmailTranscriptPaneLoading", // started, completed
    EmailTranscriptSent = "EmailTranscriptSent", // started, Failed
    EmailTranscriptCancelButtonClicked = "EmailTranscriptCancelButtonClicked", 

    // notifcation pane
    UXNotificationPaneLoading = "UXNotificationPaneLoading", // started, completed
    NotificationDismissButtonClicked = "NotificationDismissButtonClicked",
    NotificationCloseChatButtonClicked = "NotificationCloseChatButtonClicked",
    
    // end chat
    PrepareEndChat = "PrepareEndChat",
    EndChatFailed = "EndChatFailed", 
    DisconnectEndChatSDKCallFailed = "DisconnectEndChatSDKCallFailed",
    EndingAdapterAfterDisconnectionError = "EndingAdapterAfterDisconnectionError",
    ParticipantsRemovedEvent = "ParticipantsRemovedEvent",
    EndChatEventReceived = "EndChatEventReceived",
    ChatDisconnectThreadEventReceived = "ChatDisconnectThreadEventReceived",
    ChatAlreadyTriggered  = "ChatAlreadyTriggered",
    CustomContextReceived = "CustomContextReceived",
    EndChatSDKCall  = "EndChatSDKCall", 
    ConversationEndedThreadEventReceived = "ConversationEndedThreadEventReceived",
    CloseChatCall = "CloseChatCall",
    CloseChatMethodException = "CloseChatMethodException",


    //close
    UXCloseConfirmationPaneLoading = "UXCloseConfirmationPaneLoading", // started, completed
    ConfirmationConfirmButtonClicked = "ConfirmationConfirmButtonClicked",
    ConversationEndedByCustomer = "ConversationEndedByCustomer",
    ConfirmationCancelButtonClicked = "ConfirmationCancelButtonClicked",

    //activity subscriber
    SetBotAuthProviderNotFound = "SetBotAuthProviderNotFound",
    SetBotAuthProviderDisplayCard = "SetBotAuthProviderDisplayCard",
    BotAuthActivityEmptySasUrl = "BotAuthActivityEmptySasUrl",
    BotAuthActivityUndefinedSignInId = "BotAuthActivityUndefinedSignInId",
    SetBotAuthProviderFetchConfig = "SetBotAuthProviderFetchConfig",

    //post chat
    UXPostChatLoadingPaneLoading = "UXPostChatLoadingPaneLoading", // started, completed
    PostChatSurveyLoading = "PostChatSurveyLoading", // started, completed
    CustomerVoiceResponsePageLoading = "CustomerVoiceResponsePageLoading", // started, completed
    CustomerVoiceFormResponseSubmitted = "CustomerVoiceFormResponseSubmitted", 
    CustomerVoiceFormResponseError = "CustomerVoiceFormResponseError",
    PostChatContextCall = "PostChatContextCall", // completed, failed
    EmbedModePostChatWorkflowStarted = "EmbedModePostChatWorkflowStarted", 
    AppStatesException = "AppStatesException", 

    //video calling
    VoiceVideoSdkInitialize = "VoiceVideoSdkInitialize", // started, completed, failed
    CallAdded = "CallAdded",
    RemoteVideoStreamAdded = "RemoteVideoStreamAdded",
    LocalVideoStreamAdded = "LocalVideoStreamAdded",
    RemoteVideoStreamRemoved = "RemoteVideoStreamRemoved",
    LocalVideoStreamRemoved = "LocalVideoStreamRemoved",
    CallDisconnected = "CallDisconnected",
    IncomingCallEnded = "IncomingCallEnded",
    CallRejectClick = "CallRejectClick", //started, failed
    VoiceCallAcceptButtonClick = "VoiceCallAcceptButtonClick", //started, failed
    VideoCallAcceptButtonClick = "VideoCallAcceptButtonClick", //started, failed
    VoiceVideoAcceptCallException = "VoiceVideoAcceptCallException", 
    VoiceVideoAcceptCallWithVideoException  = "VoiceVideoAcceptCallWithVideoException",
    EndCallButtonClick = "EndCallButtonClick", //started, failed
    ToggleMuteButtonClick = "ToggleMuteButtonClick", //started, failed
    ToggleCameraButtonClick = "ToggleCameraButtonClick", //started, failed
    CallingSDKLoadSuccess = "CallingSDKLoadSuccess", // success, failed

    // OOB
    WidgetCustomizationConfigError = "WidgetCustomizationConfigError",
    UnrecognizedOrgUrl = "UnrecognizedOrgUrl",
    OOBWidgetStarted = "OOBWidgetStarted",
    LCWOnMessageReceivedEventTriggered = "LCWOnMessageReceivedEventTriggered",
    CloseChatMethodStarted = "CloseChatMethodStarted",
    GetAgentAvailabilityMethod = "GetAgentAvailabilityMethod", //started, failed
    SetBotAuthTokenProviderMethod = "SetBotAuthTokenProviderMethod", //started, failed
    SetContextProviderMethodStarted = "SetContextProviderMethodStarted", 
    StartChatMethodStarted = "StartChatMethodStarted",
    ProactiveChatNotEnabled = "ProactiveChatNotEnabled",
    ProactiveChatNotAllowedDuringOutOfOperatingHours = "ProactiveChatNotAllowedDuringOutOfOperatingHours",
    StartProactiveChatMethodStarted = "StartProactiveChatMethodStarted", 
    CustomerAuthFunctionCalled = "CustomerAuthFunctionCalled",
    AuthClientMethodException = "AuthClientMethodException",
    InvalidAuthClientMethod = "InvalidAuthClientMethod",
    AuthClientEmptyTokenException = "AuthClientEmptyTokenException",
    GetAuthTokenFromOuterScope = "GetAuthTokenFromOuterScope",
    InvalidDomain = "InvalidDomain",
    CustomizationStringParseFailureExceptionMessage = "CustomizationStringParseFailureExceptionMessage",
    LogLCWFeatures = "LogLCWFeatures",
    WebOrchestrationEngineEnded = "WebOrchestrationEngineEnded",
    WebOrchestrationEngineStarted = "WebOrchestrationEngineStarted",
    WebOrchestrationExecutionCompleted = "WebOrchestrationExecutionCompleted",
    WebOrchestrationExecutionException = "WebOrchestrationExecutionException",
    WebOrchestrationEngineFetchRulesException = "WebOrchestrationEngineFetchRulesException",
    WebOrchestrationRuleAction = "WebOrchestrationRuleAction",
    PopoutCustomerClosingTab = "PopoutCustomerClosingTab",
    CustomerClosingTab = "CustomerClosingTab",
    LiveChatVisibilityFalse = "LiveChatVisibilityFalse",
    LiveChatVisibilityTrue = "LiveChatVisibilityTrue",
    GetAgentAvailabilityMethodStarted = "GetAgentAvailabilityMethodStarted", 
    GetAgentAvailabilityMethodException = "GetAgentAvailabilityMethodException",
}