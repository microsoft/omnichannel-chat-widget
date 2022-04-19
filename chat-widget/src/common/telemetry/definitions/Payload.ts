export interface ConfigValidationTelemetryData {
    Event?: string;
    RequestId?: string;
    LCWVersion?: string;
    Language?: string;
    ElapsedTimeInMilliseconds?: number;
    CloudType?: string;
    ExceptionDetails?: object;
    Domain?: string;
}

export interface LoadTelemetryData {
    Event?: string;
    ResourcePath?: string;
    ElapsedTimeInMilliseconds?: number;
    WidgetState?: string;
    ChatState?: string;
    ChatType?: string;
    ExceptionDetails?: object;
}

export interface MessageProcessingErrorData {
    Event: string;
    ExceptionDetails: object;
}

export interface OCChatSDKTelemetryData {
    RequestId: string;
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    TransactionId: string;
    ExceptionDetails?: object;
}

export interface IC3ClientTelemetryData {
    SubscriptionId?: string;
    EndpointUrl?: string;
    EndpointId?: string;
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    ErrorCode?: string;
    ExceptionDetails?: object;
    ShouldBubbleToHost?: boolean;
    Description?: string;
}

export interface WebChatTelemetryData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dimensions?: any;
    duration?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any;
    fatal?: boolean;
    level?: string;
    Event?: string;
    name?: string;
    type?: string;
}

export interface ACSAdapterTelemetryData {
    Description?: string;
    ACSUserId?: string;
    ChatThreadId?: string;
    ChatMessageId?: string;
    TimeStamp?: string;
    Event?: string;
    ErrorCode?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ExceptionDetails?: any;
}

export interface ActionTelemetryData {
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    ActionType?: string;
    ExceptionDetails?: object;
    Description?: string;
}

export interface CallingTelemetryData {
    CallId?: string;
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    ExceptionDetails?: object;
    Description?: string;
}

export type TelemetryData = ConfigValidationTelemetryData | OCChatSDKTelemetryData |
    IC3ClientTelemetryData | LoadTelemetryData | ActionTelemetryData | WebChatTelemetryData |
    CallingTelemetryData | MessageProcessingErrorData;