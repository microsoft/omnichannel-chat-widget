import { AudioNotificationOffIconBase64, AudioNotificationOnIconBase64, TranscriptDownloadIconBase64, TranscriptEmailIconBase64 } from "../../../../assets/Icons";

import { IFooterControlProps } from "../../interfaces/IFooterControlProps";

export const customFooterControlProps: IFooterControlProps = {
    id: "oc-lcw-footer",
    hideDownloadTranscriptButton: false,
    hideEmailTranscriptButton: false,
    hideAudioNotificationButton: false,
    onDownloadTranscriptClick: function () { console.log("download transcript clicked"); },
    onEmailTranscriptClick: function () { console.log("email transcript clicked"); },
    onAudioNotificationClick: function () { console.log("audio notification clicked"); },
    middleGroup: { children: [] },
    leftGroup: { children: [] },
    rightGroup: { children: [] },
    downloadTranscriptButtonProps: {
        id: "oc-lcw-footer-downloadtranscript-button",
        type: "icon",
        imageIconProps: { src: TranscriptDownloadIconBase64 },
        ariaLabel: "Download chat transcript",
    },
    emailTranscriptButtonProps: {
        id: "oc-lcw-footer-emailtranscript-button",
        type: "icon",
        imageIconProps: { src: TranscriptEmailIconBase64 },
        ariaLabel: "Email Transcript",
    },
    audioNotificationButtonProps: {
        id: "oc-lcw-footer-audionotification-button",
        ariaLabel: "Turn sound off",
        toggleAriaLabel: "Turn sound on",
        imageIconProps: { src: AudioNotificationOnIconBase64 },
        imageToggleIconProps: { src: AudioNotificationOffIconBase64 }
    }
};