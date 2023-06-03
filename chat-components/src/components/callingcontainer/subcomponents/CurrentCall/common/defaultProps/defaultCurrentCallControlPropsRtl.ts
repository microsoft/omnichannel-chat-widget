import { CallRejectButtonBase64, VideoOffIconBase64, VideoOnIconBase64, VoiceOffIconBase64, VoiceOnIconBase64 } from "../../../../../../assets/Icons";
import { AriaLabels, ButtonTypes, Ids } from "../../../../../../common/Constants";

import { ICurrentCallControlProps } from "../../interfaces/ICurrentCallControlProps";

export const defaultCurrentCallControlPropsRtl: ICurrentCallControlProps = {
    id: Ids.DefaultCurrentCallId,
    nonActionIds: {
        currentCallActionGroupId: Ids.CurrentCallActionGroupId,
        currentCallFooterId: Ids.CurrentCallFooterId,
        remoteVideoTileId: Ids.RemoteVideoTileId,
        selfVideoTileId: Ids.SelfVideoTileId,
        videoTileGroupId: Ids.VideoTileGroupId
    },
    hideMicButton: false,
    hideVideoButton: false,
    hideEndCallButton: false,
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
        id: Ids.EndCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.EndCall,
        imageIconProps: {
            src: CallRejectButtonBase64,
            styles: { image: { height: "18px", width: "18px" } }
        }
    },
    micButtonProps: {
        id: Ids.MicButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.MicMute,
        toggleAriaLabel: AriaLabels.MicUnmute,
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
        id: Ids.VideoButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.VideoTurnCameraOn,
        toggleAriaLabel: AriaLabels.VideoTurnCameraOff,
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
        id: Ids.CallTimerId
    },
};