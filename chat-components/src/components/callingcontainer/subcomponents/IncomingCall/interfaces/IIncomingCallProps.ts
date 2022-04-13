import { IIncomingCallStyleProps } from "./IIncomingCallStyleProps";
import { IIncomingCallControlProps } from "./IIncomingCallControlProps";
import { IIncomingCallComponentOverrides } from "./IIncomingCallComponentOverrides";

export interface IIncomingCallProps {
    /**
    * Incoming call toast overriding children component properties
    */
    componentOverrides?: IIncomingCallComponentOverrides,

    /**
    * Incoming call toast children control properties
    */
    controlProps?: IIncomingCallControlProps,

    /**
    * Incoming call toast general and children styles
    */
    styleProps?: IIncomingCallStyleProps
}