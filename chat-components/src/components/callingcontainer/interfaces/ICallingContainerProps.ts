import { ICallingContainerStyleProps } from "./ICallingContainerStyleProps";
import { ICallingContainerControlProps } from "./ICallingContainerControlProps";

export interface ICallingContainerProps {
    /**
     * Calling container toast children control properties
     */
    controlProps?: ICallingContainerControlProps,
    
    /**
     * Calling container toast general and children styles
     */
    styleProps?: ICallingContainerStyleProps
}