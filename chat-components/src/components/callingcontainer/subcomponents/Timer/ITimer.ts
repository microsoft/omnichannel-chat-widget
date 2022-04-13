import { IStyle } from "@fluentui/react";

export interface ITimer {
    /**
    * Timer Id
    */
    id?: string,

    /**
    * Show hours
    */
    showHours?: boolean

    /**
    * Timer style props
    */
   timerStyles?: IStyle
}