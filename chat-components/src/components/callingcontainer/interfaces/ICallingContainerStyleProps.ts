import { IStyle } from "@fluentui/react";
import { ICurrentCallStyleProps } from "../subcomponents/CurrentCall/interfaces/ICurrentCallStyleProps";
import { IIncomingCallStyleProps } from "../subcomponents/IncomingCall/interfaces/IIncomingCallStyleProps";

export interface ICallingContainerStyleProps {
    /**
     * Calling container style settings.
     */
    generalStyleProps?: IStyle,

    /**
     * Calling container class name
     */
    className?: string,

    /**
    * Incoming call style props.
    */
    incomingCallStyleProps?: IIncomingCallStyleProps,

    /**
    * Current Call style props.
    */
    currentCallStyleProps?: ICurrentCallStyleProps,
}