import { ReactNode } from "react";
import { ICurrentCallNonActionControlIds } from "./ICurrentCallNonActionControlIds";
import { ICommandButtonControlProps } from "../../../../common/interfaces/ICommandButtonControlProps";
import { ITimer } from "../../Timer/ITimer";

export interface ICurrentCallControlProps {
    /**
    * Incoming call toast control id
    */
    id?: string,

    /**
    * Aria Label
    */
    ariaLabel?: string,

    /**
    * Non action ids 
    */
    nonActionIds?: ICurrentCallNonActionControlIds,

    /**
    * Control group appearing at left side of Incoming call toast control
    * appear in order as added into the array
    */
    leftGroup?: {
        gap?: number,
        children: ReactNode[] | string[]
    },

    /**
    * Control group appearing at middle of Incoming call toast control
    * appear in order as added into the array
    */
    middleGroup?: {
        gap?: number,
        children: ReactNode[] | string[]
    },

    /**
    * Control group appearing at right side of Incoming call toast control
    * appear in order as added into the array
    */
    rightGroup?: {
        gap?: number,
        children: ReactNode[] | string[]
    },

    /**
    * Hide audio call button
    */
    hideMicButton?: boolean,

    /**
    * Hide video call button
    */
    hideVideoButton?: boolean,

    /**
    * Hide decline call button
    */
    hideEndCallButton?: boolean,

    /**
    * Hide call timer
    */
    hideCallTimer?: boolean,

    /**
    * Video call enabled
    */
    videoCallDisabled?: boolean,

    /**
    * Local video enabled
    */
    selfVideoDisabled?: boolean,

    /**
    * Remote video enabled
    */
    remoteVideoDisabled?: boolean,

    /**
    * Decline call button click event
    */
    onEndCallClick?: () => void;

    /**
    * Audio call button click event
    */
    onMicCallClick?: () => void;

    /**
    * Video call button click event
    */
    onVideoOffClick?: () => void;

    /**
    * Audio call button props
    */
    micButtonProps?: ICommandButtonControlProps,

    /**
    * Video call button props
    */
    videoButtonProps?: ICommandButtonControlProps,

    /**
    * Decline call button props
    */
    endCallButtonProps?: ICommandButtonControlProps,

    /**
    * Incoming call timer props
    */
    callTimerProps?: ITimer,

    /**
    * Incoming call toast component to align right to left.
    */
    dir?: "rtl" | "ltr" | "auto";
}