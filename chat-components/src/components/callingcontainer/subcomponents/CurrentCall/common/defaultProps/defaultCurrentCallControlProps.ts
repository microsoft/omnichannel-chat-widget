import { ICurrentCallControlProps } from "../../interfaces/ICurrentCallControlProps";

export const defaultCurrentCallControlProps: ICurrentCallControlProps = {
    id: "currentCall-container",
    nonActionIds: {
        currentCallActionGroupId: "currentCall-actionicons",
        currentCallFooterId: "currentCall-footer",
        remoteVideoTileId: "remoteVideo",
        selfVideoTileId: "selfVideo",
        videoTileGroupId: "currentCall-body"
    },
    hideMicButton: false,
    hideVideoButton: false,
    hideEndCallButton: false,
    hideCurrentCallTitle: false,
    videoCallDisabled: false,
    hideCallTimer: false,
    onEndCallClick: function () { console.log("end call clicked"); },
    onMicCallClick: function () { console.log("mute clicked"); },
    onVideoOffClick: function () { console.log("video off clicked"); },
    middleGroup: { gap: 1, children: [] },
    leftGroup: { gap: 1, children: [] },
    rightGroup: { gap: 1, children: [] },
    endCallButtonProps: {
        id: "callRejectButton",
        type: "icon",
        ariaLabel: "End Call",
        iconName: "DeclineCall",
        iconSize: 18
    },
    micButtonProps: {
        id: "toggleAudio",
        type: "icon",
        ariaLabel: "Mute",
        toggleAriaLabel: "Unmute",
        iconName: "Microphone",
        toggleIconName: "MicOff2",
        iconSize: 18
    },
    videoButtonProps: {
        id: "toggleVideo",
        type: "icon",
        ariaLabel: "Turn on camera",
        toggleAriaLabel: "Turn off camera",
        iconName: "Video",
        toggleIconName: "VideoOff",
        iconSize: 18
    },
    callTimerProps: {
        id: "oc-lcw-CurrentCall-timer",
        showHours: false,
        timerStyles: {
            color: "white",
            textAlign: "center",
            backgroundColor: "#3d3c3c",
            height: "45px",
            width: "50px",
            lineHeight: "40px",
            borderRadius: "2px",
            margin: "1px"
        }
    }
};