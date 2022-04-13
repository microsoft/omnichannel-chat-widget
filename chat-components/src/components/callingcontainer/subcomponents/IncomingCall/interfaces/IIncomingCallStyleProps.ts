import { IStyle } from "@fluentui/react";

export interface IIncomingCallStyleProps {
    /**
    * Incoming call toast control style settings.
    */
    generalStyleProps?: IStyle,

    /**
    * Download Transcript button style props
    */
    audioCallButtonStyleProps?: IStyle,

    /**
    * Download Transcript button hover style props
    */
    audioCallButtonHoverStyleProps?: IStyle,

    /**
    * Download Transcript button hover style props
    */
    videoCallButtonStyleProps?: IStyle,

    /**
    * Email Transcript button style props
    */
    videoCallButtonHoverStyleProps?: IStyle,

    /**
    * Email Transcript button style props
    */
    declineCallButtonStyleProps?: IStyle,

    /**
    * Email Transcript button hover style props
    */
    declineCallButtonHoverStyleProps?: IStyle,

    /**
    * Email Transcript button hover style props
    */
    incomingCallTitleStyleProps?: IStyle,

    /**
    * Incoming call toast item focus style props
    */
    itemFocusStyleProps?: IStyle,

    /**
    * Incoming toast control class name
    */
    className?: string,
}