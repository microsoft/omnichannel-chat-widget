import { ICurrentCallStyleProps } from "./ICurrentCallStyleProps";
import { ICurrentCallControlProps } from "./ICurrentCallControlProps";
import { ICurrentCallComponentOverrides } from "./ICurrentCallComponentOverrides";

export interface ICurrentCallProps {
    /**
    * Incoming call toast overriding children component properties
    */
    componentOverrides?: ICurrentCallComponentOverrides,

    /**
    * Incoming call toast children control properties
    */
    controlProps?: ICurrentCallControlProps,

    /**
    * Incoming call toast general and children styles
    */
    styleProps?: ICurrentCallStyleProps
}