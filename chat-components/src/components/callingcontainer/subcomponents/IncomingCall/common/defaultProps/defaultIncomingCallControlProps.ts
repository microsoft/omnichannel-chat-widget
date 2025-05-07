import { AriaLabels, IconNames, ButtonTypes, Ids, Texts } from "../../../../../../common/Constants";
import { IIncomingCallControlProps } from "../../interfaces/IIncomingCallControlProps";

export const defaultIncomingCallControlProps: IIncomingCallControlProps = {
    id: Ids.DefaultIncomingCallId,
    dir: "ltr",
    ariaLabel: AriaLabels.IncomingCallArea,
    hideAudioCall: false,
    hideVideoCall: false,
    hideDeclineCall: false,
    hideIncomingCallTitle: false,
    onDeclineCallClick: function () { console.log("decline call clicked"); },
    onAudioCallClick: function () { console.log("audio call clicked"); },
    onVideoCallClick: function () { console.log("video call clicked"); },
    middleGroup: { gap: 5, children: [] },
    leftGroup: { gap: 5, children: [] },
    rightGroup: { gap: 5, children: [] },
    declineCallButtonProps: {
        id: Ids.DeclineCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.RejectCall,
        iconName: IconNames.DeclineCall,
        iconSize: 20
    },
    audioCallButtonProps: {
        id: Ids.AudioCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.AcceptVoiceCall,
        iconName: IconNames.IncomingCall,
        iconSize: 20
    },
    videoCallButtonProps: {
        id: Ids.VideoCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.AcceptVideoCall,
        iconName: IconNames.Video,
        iconSize: 20
    },
    incomingCallTitle: {
        id: Ids.IncomingCallTitleId,
        text: Texts.IncomingCallTitle
    }
};