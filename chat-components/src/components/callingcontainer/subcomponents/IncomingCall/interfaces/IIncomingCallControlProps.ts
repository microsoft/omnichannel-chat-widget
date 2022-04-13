import { ReactNode } from "react";
import { ILabelControlProps } from "../../../../common/interfaces/ILabelControlProps";
import { ICommandButtonControlProps } from "../../../../common/interfaces/ICommandButtonControlProps";

export interface IIncomingCallControlProps {
    /**
    * Incoming call toast control id
    */
    id?: string,

    /**
    * Aria Label
    */
    ariaLabel?: string,

    /**
    * IncomingCall toast container class name
    */
    className?: string,

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
    hideAudioCall?: boolean,

    /**
    * Hide video call button
    */
    hideVideoCall?: boolean,

    /**
    * hide decline call button
    */
    hideDeclineCall?: boolean,

    /**
    * Hide incoming call label
    */
    hideIncomingCallTitle?: boolean,

    /**
    * Decline call button click event
    */
    onDeclineCallClick?: () => void;

    /**
    * Audio call button click event
    */
    onAudioCallClick?: () => void;

    /**
    * Video call button click event
    */
    onVideoCallClick?: () => void;

    /**
    * Audio call button props
    */
    audioCallButtonProps?: ICommandButtonControlProps,

    /**
    * Video call button props
    */
    videoCallButtonProps?: ICommandButtonControlProps,

    /**
    * Decline call button props
    */
    declineCallButtonProps?: ICommandButtonControlProps,

    /**
    * Incoming call label props
    */
    incomingCallTitle?: ILabelControlProps,

    /**
    * Incoming call toast component to align right to left.
    */
    dir?: "rtl" | "ltr" | "auto"
}