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
        icon: props.styles,
        root: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            width: (props?.styles as any)?.width,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            height: (props?.styles as any)?.height,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            backgroundColor: (props?.styles as any)?.backgroundColor,
            selectors: {
                ":hover .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: (props?.hoverStyles as any)?.color
                },
                ":active .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: (props?.focusStyles as any)?.color
                }
            }
        },
        rootHovered: props.hoverStyles,
        rootFocused: props.focusStyles,
        rootPressed: props.hoverStyles
    };

    //imageIconProps > iconName
    const volume0Icon: IIconProps = props.imageToggleIconProps ? { imageProps: props?.imageToggleIconProps } : { iconName: props?.toggleIconName ?? "Volume0" };
    const volume3Icon: IIconProps = props.imageIconProps ? { imageProps: props?.imageIconProps } : { iconName: props?.iconName ?? "Volume3" };

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
            aria-label={muted ?
                props.toggleAriaLabel ?? "Turn sound on" :
                props.ariaLabel ?? "Turn sound off"}
            title={muted ?
                props.toggleAriaLabel ?? "Turn sound on" :
                props.ariaLabel ?? "Turn sound off"}
        />
    );
}

export default AudioNotificationButton;