import { IImageProps } from "@fluentui/react";

export interface ICommandButtonControlProps {
    id?: string;
    type?: "text" | "icon";
    isAudioMuted?: boolean;
    iconSize?: string | number;
    iconName?: string;
    imageIconProps?: IImageProps;
    toggleIconName?: string;
    imageToggleIconProps?: IImageProps;
    ariaLabel?: string;
    toggleAriaLabel?: string;
    text?: string;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}