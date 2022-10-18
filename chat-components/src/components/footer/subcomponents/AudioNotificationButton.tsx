import { IButtonStyles, IconButton, IIconProps } from "@fluentui/react";
import React, { useCallback, useEffect, useState } from "react";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import { BroadcastService } from "../../../services/BroadcastService";
import { ElementType } from "../../../common/Constants";

function AudioNotificationButton(props: ICommandButtonProps) {
    const { disabled } = props;

    const [muted, setMuted] = useState<boolean | undefined>(props.isAudioMuted);

    let iconStyles = {};
    if (props.type === "icon") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconStyles = { ...((props?.styles as any).icon as any) };
    }

    const iconButtonStyles: IButtonStyles = {
        icon: iconStyles,
        root: {
            selectors: {
                ":hover .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((props?.hoverStyles as any).icon as any)
                },
                ":active .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((props?.hoverStyles as any).icon as any)
                },
                ":focus .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((props?.focusStyles as any).icon as any)
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(props?.styles as any)
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