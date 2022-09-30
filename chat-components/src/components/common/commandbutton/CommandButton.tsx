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
        { iconName: props.iconName, styles: { root: props.styles } };

    const buttonStyles: IButtonStyles = {
        root: props.styles,
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