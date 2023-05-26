export interface IWebChatTranscriptConfig {
    /**
     * Whether to disable the feature
     */
    disabled?: boolean;
    /**
     * Transcript page title
     */
    title?: string;

    /**
    * Attachment message prefix for file attachment
    */
    attachmentMessage?: string;

    /**
     * Message on network connecting back online
     */
    networkOnlineMessage?: string;

    /**
     * Message on network disconnection
     */
    networkOfflineMessage?: string;

    /**
     * Background color of the transcript (location where the messages are displayed in WebChat)
     */
    transcriptBackgroundColor?: string;

    /**
     * Background color of the agent avatar
     */
    agentAvatarBackgroundColor?: string;

    /**
     * Text font color of the agent avatar
     */
    agentAvatarFontColor?: string;

    /**
     * Background color of the customer avatar
     */
    customerAvatarBackgroundColor?: string;

    /**
     * Text font color of the customer avatar
     */
    customerAvatarFontColor?: string;
}