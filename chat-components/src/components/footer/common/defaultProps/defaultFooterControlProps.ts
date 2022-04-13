import { IFooterControlProps } from "../../interfaces/IFooterControlProps";

export const defaultFooterControlProps: IFooterControlProps = {
    id: "lcw-components-footer",
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
        iconName: "Download",
        ariaLabel: "Download chat transcript",
    },
    emailTranscriptButtonProps: {
        id: "oc-lcw-footer-emailtranscript-button",
        type: "icon",
        iconName: "Mail",
        ariaLabel: "Email Transcript",
    },
    audioNotificationButtonProps: {
        id: "oc-lcw-footer-audionotification-button",
        ariaLabel: "Turn sound off",
        toggleAriaLabel: "Turn sound on",
        iconName: "Volume3",
        toggleIconName: "Volume0"
    }
};