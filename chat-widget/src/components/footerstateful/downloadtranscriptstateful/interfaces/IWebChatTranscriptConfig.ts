export interface IWebChatTranscriptConfig {
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
}