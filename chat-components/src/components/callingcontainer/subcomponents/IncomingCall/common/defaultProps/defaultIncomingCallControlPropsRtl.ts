import { CallAcceptButtonBase64, CallRejectButtonBase64, VideoCallAcceptButtonIconBase64 } from "../../../../../../assets/Icons";
import { AriaLabels, ButtonTypes, Ids, Texts } from "../../../../../../common/Constants";

import { IIncomingCallControlProps } from "../../interfaces/IIncomingCallControlProps";

export const defaultIncomingCallControlPropsRtl: IIncomingCallControlProps = {
    id: Ids.DefaultIncomingCallPopupId,
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
    dir: "rtl",
    declineCallButtonProps: {
        id: Ids.DeclineCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.DeclineCall,
        imageIconProps: {
            src: CallRejectButtonBase64,
            styles: { image: { height: "18px", width: "18px" } }
        },
        iconSize: 20
    },
    audioCallButtonProps: {
        id: Ids.AudioCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.AudioCall,
        imageIconProps: {
            src: CallAcceptButtonBase64,
            styles: { image: { height: "18px", width: "18px" } }
        },
        iconSize: 20
    },
    videoCallButtonProps: {
        id: Ids.VideoCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.VideoCall,
        imageIconProps: {
            src: VideoCallAcceptButtonIconBase64,
            styles: { image: { height: "18px", width: "18px" } }
        },
        iconSize: 20
    },
    incomingCallTitle: {
        id: Ids.IncomingCallTitleId,
        text: Texts.IncomingCallTitle
    }
};