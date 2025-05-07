import { IWebChatTranscriptConfig } from "./IWebChatTranscriptConfig";

export interface IDownloadTranscriptProps {
    /**
    * Attachment message prefix for download chat transcript
    */
    attachmentMessage?: string;

    /**
    * Error message shown when failed to download chat transcript
    */
    bannerMessageOnError?: string;

    /**
    * Callback function for markdown render for chat transcript
    */
    renderMarkDown?: (transcriptContent: string) => string;

    /**
     * WebChat Transcript config
     */
    webChatTranscript?: IWebChatTranscriptConfig;
}