import { AriaLabels, ButtonTypes, IconNames, Ids } from "../../../../common/Constants";
import { IFooterControlProps } from "../../interfaces/IFooterControlProps";

export const defaultFooterControlProps: IFooterControlProps = {
    id: Ids.DefaultFooterId,
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
        iconName: IconNames.Download,
        ariaLabel: AriaLabels.DownloadChatTranscript,
    },
    emailTranscriptButtonProps: {
        id: Ids.EmailTranscriptButtonId,
        type: ButtonTypes.Icon,
        iconName: IconNames.Mail,
        ariaLabel: AriaLabels.EmailTranscript,
    },
    audioNotificationButtonProps: {
        id: Ids.AudioNotificationButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.TurnSoundOff,
        toggleAriaLabel: AriaLabels.TurnSoundOn,
        iconName: IconNames.Volume3,
        toggleIconName: IconNames.Volume0,
    }
};