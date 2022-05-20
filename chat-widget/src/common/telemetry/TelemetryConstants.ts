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

export enum TelemetryEvent {
    CallAdded = "CallAdded",
    LocalVideoStreamAdded = "LocalVideoStreamAdded",
    LocalVideoStreamRemoved = "LocalVideoStreamRemoved",
    RemoteVideoStreamAdded = "RemoteVideoStreamAdded",
    RemoteVideoStreamRemoved = "RemoteVideoStreamRemoved",
    CallDisconnected = "CallDisconnected",
    CallDisconnectedException = "CallDisconnectedException",
    IncomingCallEnded = "incomingCallEnded", //case sensitive
    VoiceVideoInitialize = "VoiceVideoInitialize",
    VoiceVideoInitializeException = "VoiceVideoInitializeException",
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
    GetConversationDetailsCallFailed = "GetConversationDetailsCallFailed",
    EndChatSDKCallFailed = "EndChatSDKCallFailed",
    GetChatReconnectContextSDKCallFailed = "GetChatReconnectContextSDKCallFailed",
    PostChatContextCallSucceed = "PostChatContextCallSucceed",
    PostChatContextCallFailed = "PostChatContextCallFailed",
    ParseAdaptiveCardFailed = "ParseAdaptiveCardFailed",

    WebChatLoaded = "WebChatLoaded",
    LCWChatButtonClicked = "LCWChatButtonClicked",
    LCWChatButtonShow = "LCWChatButtonShow",
    WidgetLoadComplete = "WidgetLoadComplete",
    WidgetLoadFailed = "WidgetLoadFailed",
    StartChatMethodException = "StartChatMethodException",
    CloseChatMethodException = "CloseChatMethodException",
    PrechatSurveyLoaded = "PrechatSurveyLoaded",
    PrechatSubmitted = "PrechatSubmitted",
    StartChatSDKCall = "StartChatCall",
    EndChatSDKCall = "EndChatCall",
    OnNewMessageFailed = "OnNewMessageFailed",
    OnNewMessageAudioNotificationFailed = "OnNewMessageAudioNotificationFailed",
    DownloadTranscriptResponseNullOrUndefined = "DownloadTranscriptResponseNullOrUndefined",
    EmailTranscriptSent = "EmailTranscriptSent",
    EmailTranscriptFailed = "EmailTranscriptFailed",
    DownloadTranscriptFailed = "DownloadTranscriptFailed",
    StartChatFailed = "StartChatFailed",
    IC3ThreadUpdateEventReceived = "IC3ThreadUpdateEventReceived",
    ConfirmationCancelButtonClicked = "ConfirmationCancelButtonClicked",
    ConfirmationConfirmButtonClicked = "ConfirmationConfirmButtonClicked",
    LoadingPaneLoaded = "LoadingPaneLoaded",
    EmailTranscriptLoaded = "EmailTranscriptLoaded",
    OutOfOfficePaneLoaded = "OutOfOfficePaneLoaded",
    PostChatSurveyLoaded = "PostChatSurveyLoaded",
    ConfirmationPaneLoaded = "ConfirmationPaneLoaded",
    ProactiveChatPaneLoaded = "ProactiveChatPaneLoaded",
    ReconnectChatPaneLoaded = "ReconnectChatPaneLoaded",
    HeaderCloseButtonClicked = "HeaderCloseButtonClicked",
    HeaderMinimizeButtonClicked = "HeaderMinimizeButtonClicked",
    DownloadTranscriptButtonClicked = "DownloadTranscriptButtonClicked",
    EmailTranscriptButtonClicked = "EmailTranscriptButtonClicked",
    EmailTranscriptCancelButtonClicked = "EmailTranscriptCancelButtonClicked",
    AudioToggleButtonClicked = "AudioToggleButtonClicked",
    //WebChat Middleware Events
    ProcessingHTMLTextMiddlewareFailed = "ProcessingHTMLTextMiddlewareFailed",
    ProcessingSanitizationMiddlewareFailed = "ProcessingSanitizationMiddlewareFailed",
    FormatTagsMiddlewareJSONStringifyFailed = "FormatTagsMiddlewareJSONStringifyFailed",
    QueuePositionMessageRecieved = "QueuePositionMessageRecieved",
    AverageWaitTimeMessageRecieved = "AverageWaitTimeMessageRecieved",
    DataMaskingRuleApplied = "DataMaskingRuleApplied",
    IC3ClientEvent = "IC3ClientEvent",
    ConversationEndedThreadEventReceived = "ConversationEndedThreadEventReceived",
    InvalidConfiguration = "InvalidConfiguration",
    SendTypingIndicatorSucceeded = "SendTypingIndicatorSucceeded",
    SendTypingIndicatorFailed = "SendTypingIndicatorFailed",

    PreChatSurveyStartChatMethodFailed = "PreChatSurveyStartChatMethodFailed",
    ChatAlreadyTriggered = "ChatAlreadyTriggered",
    StartProactiveChatEventReceived = "StartProactiveChatEventReceived",
    StartProactiveChatMethodFailed = "StartProactiveChatMethodFailed",
    ProactiveChatAccepted = "ProactiveChatAccepted",
    ProactiveChatRejected = "ProactiveChatRejected",
    IncomingProactiveChatScreenLoaded = "IncomingProactiveChatScreenLoaded",
    ProactiveChatClosed = "ProactiveChatClosed",
    ProactiveChatStartChat = "ProactiveChatStartChat",
    ProactiveChatStartPopoutChat = "ProactiveChatStartPopoutChat",
    ReconnectChatContinueConversation = "ReconnectChatContinueConversation",
    ReconnectChatStartNewConversation = "ReconnectChatStartNewConversation",
    ReconnectChatMinimize = "ReconnectChatMinimize",
    ChatWidgetStateChanged = "ChatWidgetStateChanged"
}

export interface TelemetryInput {
    scenarioType: ScenarioType;
    payload: TelemetryData;
}

export class TelemetryConstants {
    private static map(eventTypeOrScenarioType: TelemetryEvent): ScenarioType {
        switch (eventTypeOrScenarioType) {
        case TelemetryEvent.ParseAdaptiveCardFailed:
            return ScenarioType.CONFIG_VALIDATION;

        case TelemetryEvent.WebChatLoaded:
        case TelemetryEvent.WidgetLoadComplete:
        case TelemetryEvent.WidgetLoadFailed:
        case TelemetryEvent.IncomingProactiveChatScreenLoaded:
        case TelemetryEvent.LCWChatButtonShow:
        case TelemetryEvent.PrechatSurveyLoaded:
        case TelemetryEvent.LoadingPaneLoaded:
        case TelemetryEvent.PostChatSurveyLoaded:
        case TelemetryEvent.EmailTranscriptLoaded:
        case TelemetryEvent.OutOfOfficePaneLoaded:
        case TelemetryEvent.ConfirmationPaneLoaded:
        case TelemetryEvent.ProactiveChatPaneLoaded:
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
        case TelemetryEvent.IC3ThreadUpdateEventReceived:
        case TelemetryEvent.ConfirmationCancelButtonClicked:
        case TelemetryEvent.ConfirmationConfirmButtonClicked:
        case TelemetryEvent.PreChatSurveyStartChatMethodFailed:
        case TelemetryEvent.HeaderCloseButtonClicked:
        case TelemetryEvent.HeaderMinimizeButtonClicked:
            return ScenarioType.ACTIONS;

        case TelemetryEvent.StartChatSDKCall:
        case TelemetryEvent.StartChatMethodException:
        case TelemetryEvent.CloseChatMethodException:
        case TelemetryEvent.StartProactiveChatMethodFailed:
        case TelemetryEvent.OnNewMessageFailed:
        case TelemetryEvent.OnNewMessageAudioNotificationFailed:
        case TelemetryEvent.GetConversationDetailsCallFailed:
        case TelemetryEvent.EndChatSDKCallFailed:
        case TelemetryEvent.PostChatContextCallFailed:
        case TelemetryEvent.PostChatContextCallSucceed:
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
        case TelemetryEvent.VoiceVideoInitialize:
        case TelemetryEvent.VoiceVideoInitializeException:
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