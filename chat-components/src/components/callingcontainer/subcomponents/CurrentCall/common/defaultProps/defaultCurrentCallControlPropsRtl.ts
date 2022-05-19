import { CallRejectButtonBase64, VideoOffIconBase64, VideoOnIconBase64, VoiceOffIconBase64, VoiceOnIconBase64 } from "../../../../../../assets/Icons";

import { ICurrentCallControlProps } from "../../interfaces/ICurrentCallControlProps";

export const defaultCurrentCallControlPropsRtl: ICurrentCallControlProps = {
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
    dir: "rtl",
    endCallButtonProps: {
        id: "callRejectButton",
        type: "icon",
        ariaLabel: "End Call",
        imageIconProps: {
            src: CallRejectButtonBase64,
            styles: { image: { height: "18px", width: "18px" } }
        }
    },
    micButtonProps: {
        id: "toggleAudio",
        type: "icon",
        ariaLabel: "Mute",
        toggleAriaLabel: "Unmute",
        imageIconProps: {
            src: VoiceOnIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        },
        imageToggleIconProps: {
            src: VoiceOffIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        },
        iconSize: 18
    },
    videoButtonProps: {
        id: "toggleVideo",
        type: "icon",
        ariaLabel: "Turn camera on",
        toggleAriaLabel: "Turn camera off",
        imageIconProps: {
            src: VideoOnIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        },
        imageToggleIconProps: {
            src: VideoOffIconBase64,
            styles: { image: { height: "16px", width: "16px" } }
        },
        iconSize: 18
    },
    callTimerProps: {
        id: "oc-lcw-CurrentCall-timer"
    },
};