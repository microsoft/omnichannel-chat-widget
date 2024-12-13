export interface BaseTelemetryData {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Data?: any
}

export interface ConfigValidationTelemetryData extends BaseTelemetryData {
    Event?: string;
    RequestId?: string;
    LCWVersion?: string;
    Language?: string;
    ElapsedTimeInMilliseconds?: number;
    CloudType?: string;
    ExceptionDetails?: object;
    Domain?: string;
}

export interface LoadTelemetryData extends BaseTelemetryData {
    Event?: string;
    ResourcePath?: string;
    ElapsedTimeInMilliseconds?: number;
    WidgetState?: string;
    ChatState?: string;
    ChatType?: string;
    ExceptionDetails?: object;
    OCChatSDKVersion?: string;
    OCChatWidgetVersion?: string;
    OCChatComponentsVersion?: string;
    Description?: string;
}

export interface MessageProcessingErrorData extends BaseTelemetryData {
    Event: string;
    ExceptionDetails: object;
}

export interface OCChatSDKTelemetryData extends BaseTelemetryData {
    RequestId: string;
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    TransactionId: string;
    ExceptionDetails?: object;
    Description?: string;
}

export interface IC3ClientTelemetryData extends BaseTelemetryData {
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

export interface WebChatTelemetryData extends BaseTelemetryData {
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

export interface ACSAdapterTelemetryData extends BaseTelemetryData {
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

export interface ActionTelemetryData extends BaseTelemetryData {
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    ActionType?: string;
    ExceptionDetails?: object;
    Description?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CustomProperties?: any;
}

export interface CallingTelemetryData extends BaseTelemetryData {
    CallId?: string;
    Event?: string;
    ElapsedTimeInMilliseconds?: number;
    ExceptionDetails?: object;
    Description?: string;
}

export type TelemetryData = ConfigValidationTelemetryData | OCChatSDKTelemetryData |
    IC3ClientTelemetryData | LoadTelemetryData | ActionTelemetryData | WebChatTelemetryData |
    CallingTelemetryData | MessageProcessingErrorData;