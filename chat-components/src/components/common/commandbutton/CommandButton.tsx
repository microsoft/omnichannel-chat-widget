import { DefaultButton, IButtonStyles, IconButton, IIconProps } from "@fluentui/react";
import React, { useCallback } from "react";
import { ICommandButtonProps } from "../interfaces/ICommandButtonProps";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import { BroadcastService } from "../../../services/BroadcastService";
import { ElementType } from "../../../common/Constants";

function CommandButton(props: ICommandButtonProps) {
    //imageIconProps > iconName
    const iconProp: IIconProps = props.imageIconProps ?
        { imageProps: props.imageIconProps } :
        { iconName: props.iconName };

    const buttonStyles: IButtonStyles = {
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
                    color: (props?.hoverStyles as any)?.color
                },
                ":focus .ms-Button-icon": {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    color: (props?.focusStyles as any)?.color
                }
            }
        },
        rootHovered: props.hoverStyles,
        rootFocused: props.focusStyles,
        rootPressed: props.hoverStyles
    };

    const handleOnClick = useCallback(() => {
        if (props?.onClick) {
            const customEvent: ICustomEvent = props.customEvent ??
            {
                eventName: "onClick",
                elementType: ElementType.Custom,
                elementId: props?.id
            };
            BroadcastService.postMessage(customEvent);
            props?.onClick();
        }
    }, []);

    return (
        <>
            {props.type === "text" &&
                <DefaultButton
                    id={props.id}
                    text={props.text}
                    ariaLabel={props.ariaLabel}
                    onClick={handleOnClick}
                    disabled={props.disabled}
                    className={props.className}
                    styles={buttonStyles}
                />
            }

            {props.type === "icon" &&
                <IconButton
                    id={props.id}
                    iconProps={iconProp}
                    title={props.hideButtonTitle ? undefined : props.ariaLabel}
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