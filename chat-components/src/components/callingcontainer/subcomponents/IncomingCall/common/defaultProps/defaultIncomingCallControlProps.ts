import { IIncomingCallControlProps } from "../../interfaces/IIncomingCallControlProps";

export const defaultIncomingCallControlProps: IIncomingCallControlProps = {
    id: "oc-lcw-incomingcall",
    dir: "ltr",
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
    declineCallButtonProps: {
        id: "callRejectButton",
        type: "icon",
        ariaLabel: "Reject call",
        iconName: "DeclineCall",
        iconSize: 20
    },
    audioCallButtonProps: {
        id: "callAcceptButton",
        type: "icon",
        ariaLabel: "Accept voice call",
        iconName: "IncomingCall",
        iconSize: 20
    },
    videoCallButtonProps: {
        id: "videoCallAcceptButton",
        type: "icon",
        ariaLabel: "Accept video Call",
        iconName: "Video",
        iconSize: 20
    },
    incomingCallTitle: {
        id: "incomingCallMessage",
        text: "Incoming Call"
    }
};