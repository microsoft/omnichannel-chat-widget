import { IButtonStyles, IconButton, IIconProps } from "@fluentui/react";
import React, { useCallback, useEffect, useState } from "react";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import { BroadcastService } from "../../../services/BroadcastService";
import { ElementType } from "../../../common/Constants";

function AudioNotificationButton(props: ICommandButtonProps) {
    const { disabled } = props;

    const [muted, setMuted] = useState<boolean | undefined>(props.isAudioMuted);

    const iconButtonStyles: IButtonStyles = {
        root: props?.styles,
        rootHovered: props?.hoverStyles,
        rootFocused: props?.focusStyles
    };

    //imageIconProps > iconName
    const volume0Icon: IIconProps = props.imageToggleIconProps ? { imageProps: props?.imageToggleIconProps } : { iconName: props?.toggleIconName ?? "Volume0", styles: { root: props.styles } };
    const volume3Icon: IIconProps = props.imageIconProps ? { imageProps: props?.imageIconProps } : { iconName: props?.iconName ?? "Volume3", styles: { root: props.styles } };

    const handleOnClick = useCallback(() => {
        setMuted(!muted);

        if (props?.onClick) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.FooterSoundNotificationButton,
                elementId: props?.id,
                eventName: "OnClick"
            };
            BroadcastService.postMessage(customEvent);
            props?.onClick();
        }
    }, [props.onClick, muted]);

    useEffect(() => {
        setMuted(props.isAudioMuted);
    }, [props.isAudioMuted]);

    return (
        <IconButton
            id={props?.id}
            iconProps={muted ? volume0Icon : volume3Icon}
            onClick={handleOnClick}
            allowDisabledFocus
            disabled={disabled}
            styles={iconButtonStyles}
            className={props.className}
            title={muted ?
                props.toggleAriaLabel ?? "Turn sound on" :
                props.ariaLabel ?? "Turn sound off"}
        />
    );
}

export default AudioNotificationButton;