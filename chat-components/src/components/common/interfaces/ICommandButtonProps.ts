import { IImageProps, IStyle } from "@fluentui/react";

import { ICustomEvent } from "../../../interfaces/ICustomEvent";

export interface ICommandButtonProps {
    id?: string;
    type?: "text" | "icon";
    isAudioMuted?: boolean;
    iconName?: string;
    imageIconProps?: IImageProps;
    toggleIconName?: string;
    imageToggleIconProps?: IImageProps;
    ariaLabel?: string;
    toggleAriaLabel?: string;
    text?: string;
    onClick?: () => void;
    styles?: IStyle;
    hoverStyles?: IStyle;
    focusStyles?: IStyle;
    className?: string;
    disabled?: boolean;
    customEvent?: ICustomEvent;
    hideButtonTitle?: boolean;
}