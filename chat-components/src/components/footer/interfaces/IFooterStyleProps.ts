import { IStyle } from "@fluentui/react";

/**
 * Footer control and chidren style settings with IStyle types.
 * 
 * e.g. { background: "magneta", border: "1px solid red", "border-radius" : "0",...}
 */
export interface IFooterStyleProps {
    /**
     * Footer control style settings.
     */
    generalStyleProps?: IStyle;
    /**
     * Download Transcript button style props
     */
    downloadTranscriptButtonStyleProps?: IStyle;
    /**
     * Download Transcript button hover style props
     */
    downloadTranscriptButtonHoverStyleProps?: IStyle;
    /**
     * Email Transcript button style props
     */
    emailTranscriptButtonStyleProps?: IStyle;
    /**
     * Email Transcript button hover style props
     */
    emailTranscriptButtonHoverStyleProps?: IStyle;
    /**
     * Audio Notification button style props
     */
    audioNotificationButtonStyleProps?: IStyle;
    /**
     * Audio Notification button hover style props
     */
    audioNotificationButtonHoverStyleProps?: IStyle;
    /**
     * Footer item focus style props
     */
    footerItemFocusStyleProps?: IStyle;
}