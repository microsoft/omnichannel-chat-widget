import { ICurrentCallControlProps } from "../subcomponents/CurrentCall/interfaces/ICurrentCallControlProps";
import { IIncomingCallControlProps } from "../subcomponents/IncomingCall/interfaces/IIncomingCallControlProps";

export interface ICallingContainerControlProps {
    /**
    * Calling container toast control id
    */
    id?: string,

    /**
    * Hide audio call button
    */
    isIncomingCall?: boolean,

    /**
    * Calling container toast component to align right to left.
    */
    dir?: "rtl" | "ltr" | "auto",

    /**
    * Incoming call control props.
    */
    incomingCallControlProps?: IIncomingCallControlProps,

    /**
    * Current Call control props.
    */
    currentCallControlProps?: ICurrentCallControlProps,

    /**
    * Hide calling container control (required in case of minimize).
    */
    hideCallingContainer?: boolean,
}