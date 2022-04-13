import { ICommandButtonControlProps } from "../../common/interfaces/ICommandButtonControlProps";
import { ReactNode } from "react";

export interface IFooterControlProps {
    /**
     * Footer id
     */
    id?: string;
    /**
     * control group appearing at left side of Footer control
     * appear in order as added into the array
     */
    leftGroup?: {
        children: ReactNode[] | string[]
    };
    /**
     * control group appearing at middle of Footer control
     * appear in order as added into the array
     */
    middleGroup?: {
        children: ReactNode[] | string[]
    };
    /**
     * Control group appearing at right side of Footer control
     * appear in order as added into the array
     */
    rightGroup?: {
        children: ReactNode[] | string[]
    };
    /**
     * hide download transcript button
     */
    hideDownloadTranscriptButton?: boolean;
    /**
     * hide email transcript button
     */
    hideEmailTranscriptButton?: boolean;
    /**
     * hide audio notification button
     */
    hideAudioNotificationButton?: boolean;
    /**
     * Footer Download Transcript button click event
     */
    onDownloadTranscriptClick?: () => void;
    /**
     * Footer Email Transcript button click event
     */
    onEmailTranscriptClick?: () => void;
    /**
     * Footer Audio Notification button click event
     */
    onAudioNotificationClick?: () => void;
    /**
     * Footer Download Transcript button props
     */
    downloadTranscriptButtonProps?: ICommandButtonControlProps;
    /**
     * Footer Email Transcript button props
     */
    emailTranscriptButtonProps?: ICommandButtonControlProps;
    /**
    * Footer Audio Notification button props
    */
    audioNotificationButtonProps?: ICommandButtonControlProps;
    /**
     * Footer component to align right to left.
     */
    dir?: "rtl" | "ltr" | "auto";
}