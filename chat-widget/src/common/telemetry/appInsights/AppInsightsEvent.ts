export enum AppInsightsEvent {

    StartProactiveChatEventReceived = "StartProactiveChatEventReceived",
    ProactiveChatStartChat = "ProactiveChatStartChat",
    ProactiveChatStartPopoutChat = "ProactiveChatStartPopoutChat",
    ProactiveChatRejected = "ProactiveChatRejected",
    ProactiveChatAccepted = "ProactiveChatAccepted",
    ProactiveChatClosed = "ProactiveChatClosed",

    UXLiveChatWidgetLoading = "LiveChatWidgetLoading", // started, completed, failed
    StartChatEventReceived = "StartChatEventReceived",
    StartChatMethodException = "StartChatException",
    StartChatError = "StartChatError", 
    OutOfOfficePaneLoaded = "OutOfOfficePaneLoaded",
    NetworkDisconnected = "NetworkDisconnected",
    NetworkReconnected = "NetworkReconnected",

    LCWChatButtonShow = "LCWChatButtonShow",
    GetAuthTokenCalled = "GetAuthTokenCalled",
    ReceivedNullOrEmptyToken = "ReceivedNullOrEmptyToken",
    NewTokenFailed = "NewTokenFailed",
    NewTokenExpired = "NewTokenExpired",
    NewTokenSuccess = "NewTokenSuccess",

    MessageSent = "MessageSent",
    SystemMessageReceived = "SystemMessageReceived",
    MessageReceived = "MessageReceived",
    RehydrateMessageReceived = "RehydrateMessageReceived",
    PrechatSurveyLoaded = "PrechatSurveyLoaded",
    PrechatSubmitted = "PrechatSubmitted",
    PreChatSurveyStartChatMethodFailed = "PreChatSurveyStartChatMethodFailed",
    ParseAdaptiveCardFailed = "ParseAdaptiveCardFailed",
    PostChatSurveyLoaded = "PostChatSurveyLoaded",
    EmailTranscriptSent = "EmailTranscriptSent", // started, Failed 
   
    EndChatSDKCall = "EndChatSDKCall",
    PrepareEndChat = "PrepareEndChat",
    EndChatFailed = "EndChatFailed", 
    DisconnectEndChatSDKCallFailed = "DisconnectEndChatSDKCallFailed",
    EndingAdapterAfterDisconnectionError = "EndingAdapterAfterDisconnectionError",
    ParticipantsRemovedEvent = "ParticipantsRemovedEvent",
    EndChatEventReceived = "EndChatEventReceived",
    ChatDisconnectThreadEventReceived = "ChatDisconnectThreadEventReceived",
    CustomContextReceived = "CustomContextReceived",
    ConversationEndedThreadEventReceived = "ConversationEndedThreadEventReceived",
    CloseChatMethodException = "CloseChatMethodException",
    ConfirmationConfirmButtonClicked = "ConfirmationConfirmButtonClicked",
    ConversationEndedByCustomer = "ConversationEndedByCustomer",
    ConfirmationCancelButtonClicked = "ConfirmationCancelButtonClicked",
    HeaderMinimizeButtonClicked = "HeaderMinimizeButtonClicked",
    AttachmentUploadValidatorMiddlewareFailed = "AttachmentUploadValidatorMiddlewareFailed",
    
    //p2
    ReconnectChatContinueConversationClicked = "ReconnectChatContinueConversationClicked",
    ReconnectChatStartNewConversationClicked = "ReconnectChatStartNewConversationClicked",
    ReconnectChatMinimize = "ReconnectChatMinimize",


    //description
    ProactiveChatRejectedDescription = "Proactive chat invitation timed out."
}