import { TelemetryData } from "./definitions/Payload";

export enum ScenarioType {
    CONFIG_VALIDATION = "LCW_ConfigValidationEvents",
    LOAD = "LCW_LoadEvents",
    ACTIONS = "LCW_ActionEvents",
    SDK = "LCW_SDKEvents",
    IC3_CLIENT = "LCW_IC3ClientEvents",
    OCCHATSDK = "LCW_OCCHATSDKEvents",
    WEBCHAT = "LCW_WebChatEvents",
    CALLING = "LCW_Calling",
    UNDEFINED = "LCW_Undefined",
    ACS_ADAPTER = "LCW_ACSAdapterEvents"
}

export enum LogLevel {
    INFO = "INFO",
    DEBUG = "DEBUG",
    WARN = "WARN",
    ERROR = "ERROR"
}

// Events used in certain functionalities that are not being logged
export enum BroadcastEvent {
    LoadPostChatSurvey = "LoadPostChatSurvey",
    ChatEnded = "ChatEnded", // used for multitab notification when chat ended 
    NewMessageNotification = "NewMessageNotification",
    UnreadMessageCount = "UnreadMessageCount",
    StartProactiveChat = "StartProactiveChat",
    ProactiveChatStartChat = "ProactiveChatStartChat",
    ProactiveChatStartPopoutChat = "ProactiveChatStartPopoutChat",
    ResetProactiveChatParams = "ResetProactiveChatParams",
    InvalidAdaptiveCardFormat = "InvalidAdaptiveCardFormat",
    NewMessageSent = "NewMessageSent",
    NewMessageReceived = "NewMessageReceived",
    HistoryMessageReceived = "HistoryMessageReceived",
    RedirectPageRequest = "RedirectPageRequest",
    StartChat = "StartChat",
    StartUnauthenticatedReconnectChat = "StartUnauthenticatedReconnectChat",
    InitiateEndChat = "InitiateEndChat",
    SetCustomContext = "SetCustomContext",
    ChatRetrievedFromCache = "ChatRetrievedFromCache",
    MaximizeChat = "MaximizeChat",
    ChatInitiated = "ChatInitiated",
    CloseChat = "CloseChat",
    InitiateEndChatOnBrowserUnload = "InitiateEndChatOnBrowserUnload",
    ClosePopoutWindow = "ClosePopoutWindow",
    RaiseErrorEvent = "RaiseErrorEvent",
    NetworkDisconnected = "NetworkDisconnected",
    NetworkReconnected = "NetworkReconnected",
    SigninCardReceived = "SignInCardReceived",
    BotAuthConfigRequest = "BotAuthConfigRequest",
    BotAuthConfigResponse = "BotAuthConfigResponse",
    RemoveWidgetDataFromCache = "RemoveWidgetDataFromCache",
    InitiateStartChatInPopoutMode = "InitiateStartChatInPopoutMode",
    HideChatVisibilityChangeEvent = "hideChatVisibilityChangeEvent",
    UpdateSessionDataForTelemetry = "UpdateSessionDataForTelemetry",
    UpdateConversationDataForTelemetry = "UpdateConversationDataForTelemetry",
    ContactIdNotFound = "ContactIdNotFound",
    SyncMinimize = "SyncMinimize",
    OnWidgetError = "OnWidgetError",
    FMLTrackingCompletedAck = "FMLTrackingCompletedAck",
    FMLTrackingCompleted = "FMLTrackingCompleted",
    PersistentConversationReset = "PersistentConversationReset"
}

// Events being logged
export enum TelemetryEvent {
    FetchPersistentChatHistoryFailed = "FetchPersistentChatHistoryFailed",
    CallAdded = "CallAdded",
    LocalVideoStreamAdded = "LocalVideoStreamAdded",
    LocalVideoStreamRemoved = "LocalVideoStreamRemoved",
    RemoteVideoStreamAdded = "RemoteVideoStreamAdded",
    RemoteVideoStreamRemoved = "RemoteVideoStreamRemoved",
    CallDisconnected = "CallDisconnected",
    CallDisconnectedException = "CallDisconnectedException",
    IncomingCallEnded = "incomingCallEnded", //case sensitive
    VoiceVideoSdkInitialize = "VoiceVideoSdkInitialize",
    VoiceVideoSdkInitializeException = "VoiceVideoSdkInitializeException",
    VoiceVideoLoading = "VoiceVideoLoading",
    VoiceVideoNotLoaded = "VoiceVideoNotLoaded",
    VoiceVideoLoadingException = "VoiceVideoLoadingException",
    VoiceVideoAcceptCallException = "VoiceVideoAcceptCallException",
    VoiceVideoAcceptCallWithVideoException = "VoiceVideoAcceptCallWithVideoException",
    VideoCallAcceptButtonClick = "VideoCallAcceptButtonClick",
    VoiceCallAcceptButtonClick = "VoiceCallAcceptButtonClick",
    CallRejectClick = "CallRejectClick",
    CallRejectClickException = "CallRejectClickException",
    ToggleMuteButtonClick = "ToggleMuteButtonClick",
    ToggleMuteButtonClickException = "ToggleMuteButtonClickException",
    ToggleCameraButtonClick = "ToggleCameraButtonClick",
    ToggleCameraButtonClickException = "ToggleCameraButtonClickException",
    EndCallButtonClick = "EndCallButtonClick",
    EndCallButtonClickException = "EndCallButtonClickException",
    CallingSDKInitSuccess = "CallingSDKInitSuccess",
    CallingSDKInitFailed = "CallingSDKInitFailed",
    CallingSDKLoadSuccess = "CallingSDKLoadSuccess",
    CallingSDKLoadFailed = "CallingSDKLoadFailed",
    GetConversationDetailsCallStarted = "GetConversationDetailsCallStarted",
    GetConversationDetailsCallFailed = "GetConversationDetailsCallFailed",
    EndChatSDKCallFailed = "EndChatSDKCallFailed",
    DisconnectEndChatSDKCallFailed = "DisconnectEndChatSDKCallFailed",
    GetChatReconnectContextSDKCallStarted = "GetChatReconnectContextSDKCallStarted",
    GetChatReconnectContextSDKCallFailed = "GetChatReconnectContextSDKCallFailed",
    CheckContactIdError = "checkContactIdError",
    GetChatReconnectContextSDKCallSucceeded = "GetChatReconnectContextSDKCallSucceeded",
    ParseAdaptiveCardFailed = "ParseAdaptiveCardFailed",
    ClientDataStoreProviderFailed = "ClientDataStoreProviderFailed",
    InMemoryDataStoreFailed = "InMemoryDataStoreFailed",
    ChatVisibilityChanged = "ChatVisibilityChanged",
    EndChatSucceeded = "EndChatSucceeded",
    EndChatFailed = "EndChatFailed",
    SettingCustomContext = "SettingCustomContext",
    WebChatLoaded = "WebChatLoaded",
    PersistentChatHistoryEnabled = "PersistentChatHistoryEnabled",
    LCWChatButtonActionCompleted = "LCWChatButtonActionCompleted",
    LCWChatButtonClicked = "LCWChatButtonClicked",
    LCWChatButtonShow = "LCWChatButtonShow",
    
    WidgetLoadStarted = "WidgetLoadStarted",
    WidgetLoadComplete = "WidgetLoadComplete",
    WidgetLoadFailed = "WidgetLoadFailed",
    StartChatMethodException = "StartChatMethodException",
    CloseChatCall = "CloseChatCall",
    CloseChatMethodException = "CloseChatMethodException",
    PrechatSurveyLoaded = "PrechatSurveyLoaded",
    PrechatSurveyExpected = "PrechatSurveyExpected",
    PrechatSubmitted = "PrechatSubmitted",
    StartChatSDKCall = "StartChatCall",
    StartChatEventReceived = "StartChatEventReceived",
    EndChatSDKCall = "EndChatSDKCall",
    PrepareEndChat = "PrepareEndChat",
    EndChatEventReceived = "EndChatEventReceived",
    WindowClosed = "WindowClosed",
    OnNewMessageFailed = "OnNewMessageFailed",
    OnNewMessageAudioNotificationFailed = "OnNewMessageAudioNotificationFailed",
    DownloadTranscriptResponseNullOrUndefined = "DownloadTranscriptResponseNullOrUndefined",
    ErrorUIPaneLoaded = "ErrorUIPaneLoaded",
    DownloadTranscriptFailed = "DownloadTranscriptFailed",
    StartChatFailed = "StartChatFailed",
    ConfirmationCancelButtonClicked = "ConfirmationCancelButtonClicked",
    ConfirmationConfirmButtonClicked = "ConfirmationConfirmButtonClicked",
    LoadingPaneLoaded = "LoadingPaneLoaded",
    LoadingPaneUnloaded = "LoadingPaneUnloaded",
    StartChatErrorPaneLoaded = "StartChatErrorPaneLoaded",
    EmailTranscriptLoaded = "EmailTranscriptLoaded",
    OutOfOfficePaneLoaded = "OutOfOfficePaneLoaded",
    ConfirmationPaneLoaded = "ConfirmationPaneLoaded",
    CitationPaneLoaded = "CitationPaneLoaded",
    ProactiveChatPaneLoaded = "ProactiveChatPaneLoaded",
    ReconnectChatPaneLoaded = "ReconnectChatPaneLoaded",
    HeaderCloseButtonClicked = "HeaderCloseButtonClicked",
    CloseChatActionCompleted = "CloseChatActionCompleted",
    HeaderMinimizeButtonClicked = "HeaderMinimizeButtonClicked",
    MinimizeChatActionCompleted = "MinimizeChatActionCompleted",
    NotificationCloseChatButtonClicked = "NotificationCloseChatButtonClicked",
    NotificationDismissButtonClicked = "NotificationDismissButtonClicked",
    DownloadTranscriptButtonClicked = "DownloadTranscriptButtonClicked",
    DownloadTranscriptActionCompleted = "DownloadTranscriptActionCompleted",
    DownloadTranscriptActionFailed = "DownloadTranscriptActionFailed",
    EmailTranscriptButtonClicked = "EmailTranscriptButtonClicked",
    EmailTranscriptSent = "EmailTranscriptSent",
    EmailTranscriptFailed = "EmailTranscriptFailed",
    EmailTranscriptCancelButtonClicked = "EmailTranscriptCancelButtonClicked",
    AudioToggleButtonClicked = "AudioToggleButtonClicked",
    SuppressBotMagicCodeSucceeded = "SuppressBotMagicCodeSucceeded",
    SuppressBotMagicCodeFailed = "SuppressBotMagicCodeFailed",
    GetConversationDetailsException = "GetConversationDetailsException",
    AppStatesException = "AppStatesException",
    BrowserUnloadEventStarted = "BrowserUnloadEventStarted",
    GetAuthTokenCalled = "GetAuthTokenCalled",
    GetAuthTokenFailed = "GetAuthTokenFailed",
    ReceivedNullOrEmptyToken = "ReceivedNullOrEmptyToken",
    CustomerVoiceResponsePageLoaded = "CustomerVoiceResponsePageLoaded",
    CustomerVoiceFormResponseSubmitted = "CustomerVoiceFormResponseSubmitted",
    CustomerVoiceFormResponseError = "CustomerVoiceFormResponseError",
    CustomerVoiceFormsError = "CustomerVoiceFormsError",
    BotAuthActivityEmptySasUrl = "BotAuthActivityEmptySasUrl",
    SetBotAuthProviderFetchConfig = "SetBotAuthProviderFetchConfig",
    SetBotAuthProviderHideCard = "SetBotAuthProviderHideCard",
    SetBotAuthProviderDisplayCard = "SetBotAuthProviderDisplayCard",
    SetBotAuthProviderNotFound = "SetBotAuthProviderNotFound",
    BotAuthActivityUndefinedSignInId = "BotAuthActivityUndefinedSignInId",
    ThirdPartyCookiesBlocked = "ThirdPartyCookiesBlocked",
    ParticipantsRemovedEvent = "ParticipantsRemovedEvent",
    QueueOverflowEvent = "QueueOverflowEvent",

    //WebChat Middleware Events
    ProcessingHTMLTextMiddlewareFailed = "ProcessingHTMLTextMiddlewareFailed",
    ProcessingSanitizationMiddlewareFailed = "ProcessingSanitizationMiddlewareFailed",
    FormatTagsMiddlewareJSONStringifyFailed = "FormatTagsMiddlewareJSONStringifyFailed",
    AttachmentUploadValidatorMiddlewareFailed = "AttachmentUploadValidatorMiddlewareFailed",
    CitationMiddlewareFailed = "CitationMiddlewareFailed",

    QueuePositionMessageRecieved = "QueuePositionMessageRecieved",
    AverageWaitTimeMessageRecieved = "AverageWaitTimeMessageRecieved",
    DataMaskingRuleApplied = "DataMaskingRuleApplied",
    DataMaskingRuleApplyFailed = "DataMaskingRuleApplyFailed",
    IC3ClientEvent = "IC3ClientEvent",
    ConversationEndedThreadEventReceived = "ConversationEndedThreadEventReceived",
    ConversationEndedByCustomer = "ConversationEndedByCustomer",
    ConversationEndedByAgent = "ConversationEndedByAgent",
    InvalidConfiguration = "InvalidConfiguration",
    SendTypingIndicatorSucceeded = "SendTypingIndicatorSucceeded",
    SendTypingIndicatorFailed = "SendTypingIndicatorFailed",
    WebChatEvent = "WebChatEvent",
    FacadeChatSDKEvent = "FacadeChatSDKEvent",

    PreChatSurveyStartChatMethodFailed = "PreChatSurveyStartChatMethodFailed",
    ChatAlreadyTriggered = "ChatAlreadyTriggered",
    StartProactiveChatEventReceived = "StartProactiveChatEventReceived",
    StartProactiveChatMethodFailed = "StartProactiveChatMethodFailed",
    ProactiveChatAccepted = "ProactiveChatAccepted",
    ProactiveChatRejected = "ProactiveChatRejected",
    IncomingProactiveChatScreenLoaded = "IncomingProactiveChatScreenLoaded",
    ProactiveChatClosed = "ProactiveChatClosed",
    ReconnectChatContinueConversation = "ReconnectChatContinueConversation",
    ReconnectChatStartNewConversation = "ReconnectChatStartNewConversation",
    ReconnectChatMinimize = "ReconnectChatMinimize",

    MessageSent = "MessageSent",
    MessageReceived = "MessageReceived",
    MessageLapTrack = "MessageLapTrack",
    BotFirstMessageLapTrack = "BotFirstMessageLapTrack",
    BotFirstMessageLapTrackError = "BotFirstMessageLapTrackError",
    MessageStartLapTrackError = "MessageStartLapTrackError",
    MessageStopLapTrackError = "MessageStopLapTrackError",
    SystemMessageReceived = "SystemMessageReceived",
    RehydrateMessageReceived = "RehydrateMessageReceived",

    CustomContextReceived = "CustomContextReceived",
    CustomEventAction = "CustomEventAction",

    // Internet connection
    NetworkDisconnected = "NetworkDisconnected",
    NetworkReconnected = "NetworkReconnected",

    //Post Chat Workflow related
    LinkModePostChatWorkflowStarted = "LinkModePostChatWorkflowStarted",
    EmbedModePostChatWorkflowStarted = "EmbedModePostChatWorkflowStarted",
    PostChatWorkflowFromCustomer = "PostChatWorkflowFromCustomer",
    PostChatWorkflowFromAgent = "PostChatWorkflowFromAgent",
    PostChatWorkflowFromBot = "PostChatWorkflowFromBot",
    PostChatContextCallStarted = "PostChatContextCallStarted",
    PostChatContextCallSucceed = "PostChatContextCallSucceed",
    PostChatContextCallFailed = "PostChatContextCallFailed",
    PostChatSurveyLoadingPaneLoaded = "PostChatSurveyLoadingPaneLoaded",
    PostChatSurveyLoaded = "PostChatSurveyLoaded",
    PostChatSurveyUrlValidationCompleted = "PostChatSurveyUrlValidationCompleted",
    PostChatSurveyUrlValidationFailed = "PostChatSurveyUrlValidationFailed",

    // Chat disconnected
    ChatDisconnectThreadEventReceived = "ChatDisconnectThreadEventReceived",

    HiddenAdaptiveCardMessageReceived = "HiddenAdaptiveCardMessageReceived",
    EndingAdapterAfterDisconnectionError = "EndingAdapterAfterDisconnectionError",

    //FacadeChatSDK events
    NewTokenValidationStarted = "NewTokenValidationStarted",
    NewTokenValidationCompleted = "NewTokenValidationCompleted",
    NewTokenValidationFailed = "NewTokenValidationFailed",
    TokenEmptyOrSame = "TokenEmptyOrSame",

    //UX Telemetry Events
    UXFooterStart = "UXFooterStart",
    UXFooterCompleted = "UXFooterCompleted",
    UXHeaderStart = "UXHeaderStart",
    UXHeaderCompleted = "UXHeaderCompleted",
    UXLoadingPaneStart = "UXLoadingPaneStart",
    UXLoadingPaneCompleted = "UXLoadingPaneCompleted",
    UXNotificationPaneStart = "UXNotificationPaneStart",
    UXNotificationPaneCompleted = "UXNotificationPaneCompleted",
    UXOutOfOfficeHoursPaneStart = "UXOutOfOfficeHoursPaneStart",
    UXOutOfOfficeHoursPaneCompleted = "UXOutOfOfficeHoursPaneCompleted",
    XSSTextDetected = "XSSTextDetected",
    UXPostChatLoadingPaneStart = "UXPostChatLoadingPaneStart",
    UXPostChatLoadingPaneCompleted = "UXPostChatLoadingPaneCompleted",
    UXPrechatPaneStart = "UXPrechatPaneStart",
    UXPrechatPaneCompleted = "UXPrechatPaneCompleted",
    UXProactiveChatPaneStart = "UXProactiveChatPaneStart",
    UXProactiveChatPaneCompleted = "UXProactiveChatPaneCompleted",
    UXReconnectChatPaneStart = "UXReconnectChatPaneStart",
    UXReconnectChatCompleted = "UXReconnectChatCompleted",
    UXStartChatErrorPaneStart = "UXStartChatErrorPaneStart",
    UXStartChatErrorCompleted = "UXStartChatErrorCompleted",
    UXEmailTranscriptPaneStart = "UXEmailTranscriptPaneStart",
    UXEmailTranscriptPaneCompleted = "UXEmailTranscriptPaneCompleted",
    UXWebchatContainerStart = "UXWebchatContainerStart",
    UXWebchatContainerCompleted = "UXWebchatContainerCompleted",
    UXLCWChatButtonLoadingStart = "UXLCWChatButtonLoadingStart",
    UXLCWChatButtonLoadingCompleted = "UXLCWChatButtonLoadingCompleted",
    UXConfirmationPaneStart = "UXConfirmationPaneStart",
    UXCitationPaneStart = "UXCitationPaneStart",
    UXConfirmationPaneCompleted = "UXConfirmationPaneCompleted",
    UXCitationPaneCompleted = "UXCitationPaneCompleted",
    UXLiveChatWidgetStart = "UXLiveChatWidgetStart",
    UXLiveChatWidgetCompleted = "UXLiveChatWidgetCompleted",
    UXPostChatPaneStarted = "UXPostChatPaneStarted",
    UXPostChatPaneCompleted = "UXPostChatPaneCompleted",

    AppInsightsInitialized = "AppInsightsInitialized",
    AppInsightsInitFailed = "AppInsightsInitFailed",
    ConvertPersistentChatHistoryMessageToActivityFailed = "ConvertPersistentChatHistoryMessageToActivityFailed",
    UXLCWPersistentChatHistoryInitialized = "UXLCWPersistentChatHistoryInitialized",
    LCWPersistentChatHistoryFetchStarted = "LCWPersistentChatHistoryFetchStarted",
    LCWPersistentChatHistoryFetchCompleted = "LCWPersistentChatHistoryFetchCompleted",
    LCWPersistentChatHistoryFetchFailed = "LCWPersistentChatHistoryFetchFailed",
    LCWWebChatStorePollingStarted = "LCWWebChatStorePollingStarted",
    LCWWebChatStoreReady = "LCWWebChatStoreReady",
    LCWWebChatConnected = "LCWWebChatConnected",
    LCWWebChatDisconnected = "LCWWebChatDisconnected",
    LCWWebChatConnectionCheckFailed = "LCWWebChatConnectionCheckFailed",
    LCWPersistentConversationHandlerInitialized = "LCWPersistentConversationHandlerInitialized",
    LCWPersistentHistoryPullBlocked = "LCWPersistentHistoryPullBlocked",
    LCWPersistentHistoryPullCompleted = "LCWPersistentHistoryPullCompleted",
    LCWPersistentHistoryReturnedNull = "LCWPersistentHistoryReturnedNull",
    LCWLazyLoadInitializationStarted = "LCWLazyLoadInitializationStarted",
    LCWLazyLoadContainerNotFound = "LCWLazyLoadContainerNotFound",
    LCWLazyLoadInitializationCompleted = "LCWLazyLoadInitializationCompleted",
    LCWLazyLoadSessionMetrics = "LCWLazyLoadSessionMetrics",
    LCWLazyLoadTargetElementNotFound = "LCWLazyLoadTargetElementNotFound",
    LCWLazyLoadScrollFailed = "LCWLazyLoadScrollFailed",
    LCWLazyLoadActivityMounted = "LCWLazyLoadActivityMounted",
    LCWLazyLoadReset = "LCWLazyLoadReset",
    LCWLazyLoadNoMoreHistory = "LCWLazyLoadNoMoreHistory",
    LCWLazyLoadHistoryError = "LCWLazyLoadHistoryError",
    LCWLazyLoadDestroyed = "LCWLazyLoadDestroyed",
    LCWLazyLoadTriggerFired = "LCWLazyLoadTriggerFired",
    LCWLazyLoadBatchReceived = "LCWLazyLoadBatchReceived",
    LCWLazyLoadInitialLoadComplete = "LCWLazyLoadInitialLoadComplete",
    LCWLazyLoadScrollAnchorApplied = "LCWLazyLoadScrollAnchorApplied",

    // SecureEventBus events
    SecureEventBusUnauthorizedDispatch = "SecureEventBusUnauthorizedDispatch",
    SecureEventBusListenerError = "SecureEventBusListenerError",
    SecureEventBusDispatchError = "SecureEventBusDispatchError",
    StartChatComplete = "StartChatComplete",

}

export interface TelemetryInput {
    scenarioType: ScenarioType;
    payload: TelemetryData;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    telemetryInfo?: any;
}

export class TelemetryConstants {
    private static map(eventTypeOrScenarioType: TelemetryEvent): ScenarioType {
        switch (eventTypeOrScenarioType) {
            case TelemetryEvent.ParseAdaptiveCardFailed:
            case TelemetryEvent.ReceivedNullOrEmptyToken:
            case TelemetryEvent.GetAuthTokenCalled:
            case TelemetryEvent.SuppressBotMagicCodeSucceeded:
            case TelemetryEvent.SuppressBotMagicCodeFailed:
                return ScenarioType.CONFIG_VALIDATION;

            case TelemetryEvent.WebChatLoaded:
            case TelemetryEvent.WidgetLoadComplete:
            case TelemetryEvent.WidgetLoadFailed:
            case TelemetryEvent.IncomingProactiveChatScreenLoaded:
            case TelemetryEvent.LCWChatButtonShow:
            case TelemetryEvent.PrechatSurveyLoaded:
            case TelemetryEvent.LoadingPaneLoaded:
            case TelemetryEvent.PostChatSurveyLoadingPaneLoaded:
            case TelemetryEvent.PostChatSurveyLoaded:
            case TelemetryEvent.EmailTranscriptLoaded:
            case TelemetryEvent.OutOfOfficePaneLoaded:
            case TelemetryEvent.ConfirmationPaneLoaded:
            case TelemetryEvent.ProactiveChatPaneLoaded:
            case TelemetryEvent.ThirdPartyCookiesBlocked:
                return ScenarioType.LOAD;

            case TelemetryEvent.PrechatSubmitted:
            case TelemetryEvent.LCWChatButtonClicked:
            case TelemetryEvent.ProactiveChatAccepted:
            case TelemetryEvent.ProactiveChatRejected:
            case TelemetryEvent.ProactiveChatClosed:
            case TelemetryEvent.ProcessingHTMLTextMiddlewareFailed:
            case TelemetryEvent.DataMaskingRuleApplied:
            case TelemetryEvent.ConversationEndedThreadEventReceived:
            case TelemetryEvent.InvalidConfiguration:
            case TelemetryEvent.DownloadTranscriptResponseNullOrUndefined:
            case TelemetryEvent.EmailTranscriptSent:
            case TelemetryEvent.EmailTranscriptFailed:
            case TelemetryEvent.DownloadTranscriptFailed:
            case TelemetryEvent.ConfirmationCancelButtonClicked:
            case TelemetryEvent.ConfirmationConfirmButtonClicked:
            case TelemetryEvent.PreChatSurveyStartChatMethodFailed:
            case TelemetryEvent.HeaderCloseButtonClicked:
            case TelemetryEvent.HeaderMinimizeButtonClicked:
            case TelemetryEvent.NotificationCloseChatButtonClicked:
            case TelemetryEvent.NotificationDismissButtonClicked:
            case TelemetryEvent.MessageSent:
            case TelemetryEvent.MessageReceived:
            case TelemetryEvent.CustomContextReceived:
            case TelemetryEvent.BrowserUnloadEventStarted:
            case TelemetryEvent.NetworkDisconnected:
            case TelemetryEvent.NetworkReconnected:
            case TelemetryEvent.AudioToggleButtonClicked:
            case TelemetryEvent.EmailTranscriptCancelButtonClicked:
            case TelemetryEvent.CustomerVoiceResponsePageLoaded:
            case TelemetryEvent.CustomerVoiceFormResponseSubmitted:
            case TelemetryEvent.CustomerVoiceFormResponseError:
            case TelemetryEvent.LinkModePostChatWorkflowStarted:
            case TelemetryEvent.EmbedModePostChatWorkflowStarted:
            case TelemetryEvent.PostChatWorkflowFromCustomer:
            case TelemetryEvent.PostChatWorkflowFromAgent:
            case TelemetryEvent.PostChatWorkflowFromBot:
            case TelemetryEvent.AppStatesException:
            case TelemetryEvent.SecureEventBusUnauthorizedDispatch:
            case TelemetryEvent.SecureEventBusListenerError:
            case TelemetryEvent.SecureEventBusDispatchError:
                return ScenarioType.ACTIONS;

            case TelemetryEvent.StartChatSDKCall:
            case TelemetryEvent.StartChatEventReceived:
            case TelemetryEvent.StartChatMethodException:
            case TelemetryEvent.CloseChatMethodException:
            case TelemetryEvent.StartProactiveChatEventReceived:
            case TelemetryEvent.StartProactiveChatMethodFailed:
            case TelemetryEvent.OnNewMessageFailed:
            case TelemetryEvent.OnNewMessageAudioNotificationFailed:
            case TelemetryEvent.GetConversationDetailsCallFailed:
            case TelemetryEvent.EndChatSDKCall:
            case TelemetryEvent.EndChatEventReceived:
            case TelemetryEvent.EndChatSDKCallFailed:
            case TelemetryEvent.PostChatContextCallFailed:
            case TelemetryEvent.PostChatContextCallSucceed:
            case TelemetryEvent.GetConversationDetailsException:
            case TelemetryEvent.PrepareEndChat:
                return ScenarioType.SDK;

            case TelemetryEvent.VideoCallAcceptButtonClick:
            case TelemetryEvent.CallAdded:
            case TelemetryEvent.LocalVideoStreamAdded:
            case TelemetryEvent.LocalVideoStreamRemoved:
            case TelemetryEvent.RemoteVideoStreamAdded:
            case TelemetryEvent.RemoteVideoStreamRemoved:
            case TelemetryEvent.CallDisconnected:
            case TelemetryEvent.CallDisconnectedException:
            case TelemetryEvent.IncomingCallEnded:
            case TelemetryEvent.VoiceVideoSdkInitialize:
            case TelemetryEvent.VoiceVideoSdkInitializeException:
            case TelemetryEvent.VoiceVideoLoading:
            case TelemetryEvent.VoiceVideoNotLoaded:
            case TelemetryEvent.VoiceVideoLoadingException:
            case TelemetryEvent.VoiceVideoAcceptCallException:
            case TelemetryEvent.VoiceVideoAcceptCallWithVideoException:
            case TelemetryEvent.VoiceCallAcceptButtonClick:
            case TelemetryEvent.CallRejectClick:
            case TelemetryEvent.CallRejectClickException:
            case TelemetryEvent.ToggleMuteButtonClick:
            case TelemetryEvent.ToggleMuteButtonClickException:
            case TelemetryEvent.ToggleCameraButtonClick:
            case TelemetryEvent.ToggleCameraButtonClickException:
            case TelemetryEvent.EndCallButtonClick:
            case TelemetryEvent.EndCallButtonClickException:
            case TelemetryEvent.CallingSDKInitSuccess:
            case TelemetryEvent.CallingSDKInitFailed:
            case TelemetryEvent.CallingSDKLoadSuccess:
            case TelemetryEvent.CallingSDKLoadFailed:
                return ScenarioType.CALLING;

            default:
                return ScenarioType.ACTIONS;
        }
    }

    public static mapEventToScenario(eventTypeOrScenarioType: TelemetryEvent): ScenarioType {
        return TelemetryConstants.map(eventTypeOrScenarioType);
    }
}

export enum ConversationStage {
    Initialization = "Initialization",
    CSREngagement = "CSR Engagement",
    ConversationEnd = "Conversation End"
}
