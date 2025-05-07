import { IInputValidationPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/inputvalidationpane/interfaces/IInputValidationPaneProps";

export interface IEmailTranscriptPaneProps extends IInputValidationPaneProps {
    /**
    * Attachment message prefix for email chat transcript
    */
    attachmentMessage?: string;
    
    /**
    * Error message shown when failed to send transcript to email
    */
    bannerMessageOnError?: string;
}