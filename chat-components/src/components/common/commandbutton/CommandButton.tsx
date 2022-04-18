import { DefaultButton, IButtonStyles, IconButton, IIconProps } from "@fluentui/react";
import React, { useCallback } from "react";
import { ICommandButtonProps } from "../interfaces/ICommandButtonProps";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import { BroadcastService } from "../../../services/BroadcastService";
import { ElementType } from "../../../common/Constants";

function CommandButton(props: ICommandButtonProps) {
    //imageIconProps > iconName
    const iconProp: IIconProps = props.imageIconProps ? { imageProps: props.imageIconProps } : { iconName: props.iconName, styles:{ root: props.styles} };
 
    const iconButtonStyles: IButtonStyles = {
        root: props.styles,
        rootHovered: props.hoverStyles,
        rootFocused: props.focusStyles,
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
                    styles={iconButtonStyles}
                />
            }

            {props.type === "icon" &&
                <IconButton
                    id={props.id}
                    iconProps={iconProp}
                    title={props.ariaLabel}
                    ariaLabel={props.ariaLabel}
                    disabled={props.disabled}
                    styles={iconButtonStyles}
                    onClick={handleOnClick}
                    className={props.className}
                />
            }
        </>
    );
}

export default CommandButton;