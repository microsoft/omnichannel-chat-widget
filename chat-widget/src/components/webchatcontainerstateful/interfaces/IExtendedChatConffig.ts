export interface ExtendedChatConfig {
    LcwFcbConfiguration?: LcwFcbConfiguration;
    LiveChatConfigAuthSettings?: LiveChatConfigAuthSettings;
    LiveWSAndLiveChatEngJoin?: {
        msdyn_conversationmode?: string;
        msdyn_enablepersistentchatpreviousconversations?: boolean;
    };
}

// Types for better type safety
interface LcwFcbConfiguration {
    lcwPersistentChatHistoryEnabled?: boolean;
}

interface LiveChatConfigAuthSettings {
    msdyn_javascriptclientfunction?: string;
}