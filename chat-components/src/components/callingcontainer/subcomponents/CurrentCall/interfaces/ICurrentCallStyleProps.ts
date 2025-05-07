import { IStyle } from "@fluentui/merge-styles";
import { ICurrentCallClassNames } from "./ICurrentCallClassNames";

export interface ICurrentCallStyleProps {
    /**
    * Incoming call toast control style settings.
    */
    generalStyleProps?: IStyle,

    /**
    * Download Transcript button style props
    */
    micButtonStyleProps?: IStyle,

    /**
    * Download Transcript button hover style props
    */
    micButtonHoverStyleProps?: IStyle,

    /**
    * Download Transcript button hover style props
    */
    videoOffButtonStyleProps?: IStyle,

    /**
    * Email Transcript button style props
    */
    videoOffButtonHoverStyleProps?: IStyle,

    /**
    * Email Transcript button style props
    */
    endCallButtonStyleProps?: IStyle,

    /**
    * Email Transcript button hover style props
    */
    endCallButtonHoverStyleProps?: IStyle,

    /**
    * Video tile style props
    */
    videoTileStyleProps?: IStyle,

    /**
    * Remote video tile style props
    */
    remoteVideoStyleProps?: IStyle,

    /**
    * Self video tile style props
    */
    selfVideoStyleProps?: IStyle,

    /**
    * Incoming call toast item focus style props
    */
    itemFocusStyleProps?: IStyle,

    /**
    * Incoming toast control class name
    */
    classNames?: ICurrentCallClassNames,

    /**
    * Video tile style props
    */
    videoTileStyleWithVideoProps?: IStyle,

    /**
    * Self video maximize tile style props
    */
    selfVideoMaximizeStyleProps?: IStyle
}