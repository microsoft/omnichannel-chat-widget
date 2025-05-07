import { ReactNode } from "react";

export interface IFooterComponentOverrides {
    /**
     * custom download transcript button
     */
    DownloadTranscriptButton?: ReactNode | string;
    /**
     * custom email transcript button
     */
    EmailTranscriptButton?: ReactNode | string;
    /**
     * custom audio notification button
     */
    AudioNotificationButton?: ReactNode | string;
}