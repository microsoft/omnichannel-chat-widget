export enum ScenarioType {
    UserSendMessageStrategy = "UserSendMessageStrategy",
    SystemMessageStrategy = "SystemMessageStrategy",
    ReceivedMessageStrategy = "ReceivedMessageStrategy"
}

export type MessagePayload = {
    text: string;
    type: string;
    timestamp?: string | undefined;
    userId: string;
    tags: string[];
    messageType: string;
    Id: string | undefined;
    role: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    channelData?: any;
    chatId?: string;
    conversationId?: string;
    isChatComplete: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attachment?: any[];
};

export type TrackingMessage = {
    Id: string | undefined;
    role: string | undefined;
    timestamp: string | undefined;
    tags: string[];
    messageType: string;
    text: string;
    checkTime?: number;
    type: string;
}