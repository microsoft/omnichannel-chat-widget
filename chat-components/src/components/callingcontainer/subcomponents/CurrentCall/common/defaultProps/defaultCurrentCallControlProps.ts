import { AriaLabels, IconNames, ButtonTypes, Ids } from "../../../../../../common/Constants";
import { ICurrentCallControlProps } from "../../interfaces/ICurrentCallControlProps";

export const defaultCurrentCallControlProps: ICurrentCallControlProps = {
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
    endCallButtonProps: {
        id: Ids.EndCallButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.EndCall,
        iconName: IconNames.DeclineCall,
        iconSize: 18
    },
    micButtonProps: {
        id: Ids.MicButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.MicMute,
        toggleAriaLabel: AriaLabels.MicUnmute,
        iconName: IconNames.Microphone,
        toggleIconName: IconNames.MicOff2,
        iconSize: 18
    },
    videoButtonProps: {
        id: Ids.VideoButtonId,
        type: ButtonTypes.Icon,
        ariaLabel: AriaLabels.VideoTurnCameraOn,
        toggleAriaLabel: AriaLabels.VideoTurnCameraOff,
        iconName: IconNames.Video,
        toggleIconName: IconNames.VideoOff,
        iconSize: 18
    },
    callTimerProps: {
        id: Ids.CallTimerId,
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