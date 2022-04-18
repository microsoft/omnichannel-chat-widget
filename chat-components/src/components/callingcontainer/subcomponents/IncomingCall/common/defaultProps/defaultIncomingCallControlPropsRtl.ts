import { IIncomingCallControlProps } from "../../interfaces/IIncomingCallControlProps";
import callrejectbutton from "../../../../../../assets/imgs/callrejectbutton.svg";
import callacceptbutton from "../../../../../../assets/imgs/callacceptbutton.svg";
import videocallacceptbutton from "../../../../../../assets/imgs/videocallacceptbutton.svg";

export const defaultIncomingCallControlPropsRtl: IIncomingCallControlProps = {
    id: "incomingCallPopup",
    ariaLabel: "Incoming call area",
    hideAudioCall: false,
    hideVideoCall: false,
    hideDeclineCall: false,
    hideIncomingCallTitle: false,
    onDeclineCallClick: function () { console.log("download transcript clicked"); },
    onAudioCallClick: function () { console.log("email transcript clicked"); },
    onVideoCallClick: function () { console.log("audio notification clicked"); },
    middleGroup: { gap: 5, children: [] },
    leftGroup: { gap: 5, children: [] },
    rightGroup: { gap: 5, children: [] },
    dir: "rtl",
    declineCallButtonProps: {
        id: "callRejectButton",
        type: "icon",
        ariaLabel: "Decline Call",
        imageIconProps: {
            src: callrejectbutton,
            styles: { image: { height: "18px", width: "18px" } }
        },
        iconSize: 20
    },
    audioCallButtonProps: {
        id: "callAcceptButton",
        type: "icon",
        ariaLabel: "Audio Call",
        imageIconProps: {
            src: callacceptbutton,
            styles: { image: { height: "18px", width: "18px" } }
        },
        iconSize: 20
    },
    videoCallButtonProps: {
        id: "videoCallAcceptButton",
        type: "icon",
        ariaLabel: "Video Call",
        imageIconProps: {
            src: videocallacceptbutton,
            styles: { image: { height: "18px", width: "18px" } }
        },
        iconSize: 20
    },
    incomingCallTitle: {
        id: "incomingCallMessage",
        text: "Incoming Call"
    }
};