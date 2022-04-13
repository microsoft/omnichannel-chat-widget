import { IFooterControlProps } from "../../interfaces/IFooterControlProps";
import lcwAudioOff from "../../../../assets/imgs/lcwAudioOff.svg";
import lcwAudioOn from "../../../../assets/imgs/lcwAudioOn.svg";
import transcriptDownloadIcon from "../../../../assets/imgs/transcriptDownloadIcon.svg";
import transcriptEmailIcon from "../../../../assets/imgs/transcriptEmailIcon.svg";

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
        imageIconProps: { src: transcriptDownloadIcon },
        ariaLabel: "Download chat transcript",
    },
    emailTranscriptButtonProps: {
        id: "oc-lcw-footer-emailtranscript-button",
        type: "icon",
        imageIconProps: { src: transcriptEmailIcon },
        ariaLabel: "Email Transcript",
    },
    audioNotificationButtonProps: {
        id: "oc-lcw-footer-audionotification-button",
        ariaLabel: "Turn sound off",
        toggleAriaLabel: "Turn sound on",
        imageIconProps: { src: lcwAudioOn },
        imageToggleIconProps: { src: lcwAudioOff }
    }
};