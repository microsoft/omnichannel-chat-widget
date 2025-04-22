declare type MessagePayload = {
    id: string;
    role: string;
    timestamp: string;
    tags: string[];
    messageType: string;
    text: string;
};

declare type TrackingMessage = {
    id: string;
    role: string;
    timestamp: string;
    tags: string[];
    messageType: string;
    text: string;
    checkTime?: number;
    type: string;
}