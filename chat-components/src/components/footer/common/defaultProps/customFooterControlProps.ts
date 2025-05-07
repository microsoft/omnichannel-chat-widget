import { AudioNotificationOffIconBase64, AudioNotificationOnIconBase64, TranscriptDownloadIconBase64, TranscriptEmailIconBase64 } from "../../../../assets/Icons";
import { AriaLabels, ButtonTypes, Ids } from "../../../../common/Constants";

import { IFooterControlProps } from "../../interfaces/IFooterControlProps";

export const customFooterControlProps: IFooterControlProps = {
    id: Ids.CustomFooterId,
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
        id: Ids.DownloadTranscriptButtonId,
        type: ButtonTypes.Icon,
        imageIconProps: { src: TranscriptDownloadIconBase64 },
        ariaLabel: AriaLabels.DownloadChatTranscript,
    },
    emailTranscriptButtonProps: {
        id: Ids.EmailTranscriptButtonId,
        type: ButtonTypes.Icon,
        imageIconProps: { src: TranscriptEmailIconBase64 },
        ariaLabel: AriaLabels.EmailTranscript,
    },
    audioNotificationButtonProps: {
        id: Ids.AudioNotificationButtonId,
        ariaLabel: AriaLabels.TurnSoundOff,
        toggleAriaLabel: AriaLabels.TurnSoundOn,
        imageIconProps: { src: AudioNotificationOnIconBase64 },
        imageToggleIconProps: { src: AudioNotificationOffIconBase64 },
    }
};