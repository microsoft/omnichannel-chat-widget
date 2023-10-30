import { DefaultButton, IButtonStyles, IconButton, IIconProps } from "@fluentui/react";
import React, { useCallback } from "react";
import { ICommandButtonProps } from "../interfaces/ICommandButtonProps";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import { BroadcastService } from "../../../services/BroadcastService";
import { ElementType, EventNames, ButtonTypes } from "../../../common/Constants";

function CommandButton(props: ICommandButtonProps) {
    //imageIconProps > iconName
    const iconProp: IIconProps = props.imageIconProps ?
        { imageProps: props.imageIconProps } :
        { iconName: props.iconName };

    let iconStyles = {};
    if (props.type === ButtonTypes.Icon) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconStyles = { ...((props?.styles as any)?.icon as any) };
    }

    const buttonStyles: IButtonStyles = {
        icon: { ...iconStyles },
        root: {
            selectors: {
                ":hover .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((props?.hoverStyles as any)?.icon as any)
                },
                ":active .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((props?.hoverStyles as any)?.icon as any)
                },
                ":focus .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...((props?.focusStyles as any)?.icon as any)
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(props?.styles as any)
        },
        rootHovered: props.hoverStyles,
        rootFocused: props.focusStyles,
        rootPressed: props.hoverStyles
    };

    const handleOnClick = useCallback(() => {
        if (props?.onClick) {
            const customEvent: ICustomEvent = props.customEvent ??
            {
                eventName: EventNames.OnClick,
                elementType: ElementType.Custom,
                elementId: props?.id
            };
            BroadcastService.postMessage(customEvent);
            props?.onClick();
        }
    }, []);

    return (
        <>
            {props.type === ButtonTypes.Text &&
                <DefaultButton
                    id={props.id}
                    text={props.text}
                    ariaLabel={props.ariaLabel}
                    onClick={handleOnClick}
                    disabled={props.disabled}
                    className={props.className}
                    styles={buttonStyles}
                    title={props.ariaLabel}
                />
            }

            {props.type === ButtonTypes.Icon &&
                <IconButton
                    id={props.id}
                    iconProps={iconProp}
                    title={props.ariaLabel}
                    ariaLabel={props.ariaLabel}
                    disabled={props.disabled}
                    styles={buttonStyles}
                    onClick={handleOnClick}
                    className={props.className}
                />
            }
        </>
    );
}

export default CommandButton;