export enum AppInsightsEvent {

    StartProactiveChatEventReceived = "StartProactiveChatEventReceived",
    ProactiveChatStartChat = "ProactiveChatStartChat",
    ProactiveChatStartPopoutChat = "ProactiveChatStartPopoutChat",
    ProactiveChatRejected = "ProactiveChatRejected",
    ProactiveChatAccepted = "ProactiveChatAccepted",
    ProactiveChatClosed = "ProactiveChatClosed",

    UXLiveChatWidgetLoading = "LiveChatWidgetLoading",
    StartChatEventReceived = "StartChatEventReceived",
    StartChatMethodException = "StartChatException",
    StartChatError = "StartChatError", 
    OutOfOfficePaneLoaded = "OutOfOfficePaneLoaded",
    NetworkDisconnected = "NetworkDisconnected",
    NetworkReconnected = "NetworkReconnected",

    LCWChatButtonShow = "ChatButtonShow",
    GetAuthTokenCalled = "GetAuthTokenCalled",
    ReceivedNullOrEmptyToken = "ReceivedNullOrEmptyToken",
    NewTokenFailed = "NewTokenFailed",
    NewTokenExpired = "NewTokenExpired",
    NewTokenSuccess = "NewTokenSuccess",

    MessageSent = "MessageSent",
    SystemMessageReceived = "SystemMessageReceived",
    MessageReceived = "MessageReceived",
    RehydrateMessageReceived = "HistoryMessageReceived",
    PrechatSurveyLoaded = "PrechatSurveyLoaded",
    PrechatSubmitted = "PrechatSurveySubmitted",
    PreChatSurveyStartChatMethodFailed = "PreChatSurveyStartChatFailed",
    PostChatSurveyLoaded = "PostChatSurveyLoaded",
    EmailTranscriptSent = "EmailTranscriptSent",
   
    //pending
    EndChatSDKCall = "EndChatSDKCall",
    PrepareEndChat = "PrepareEndChat",
    EndChatFailed = "EndChatFailed", 
    DisconnectEndChatSDKCallFailed = "DisconnectEndChatSDKCallFailed",
    ParticipantsRemovedEvent = "ParticipantsRemovedEvent",
    EndChatEventReceived = "EndChatEventReceived",
    ChatDisconnectThreadEventReceived = "ChatDisconnectThreadEventReceived",
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