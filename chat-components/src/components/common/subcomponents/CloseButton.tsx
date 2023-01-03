import React from "react";
import { ElementType } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../commandbutton/CommandButton";
import { ICommandButtonProps } from "../interfaces/ICommandButtonProps";

function CloseButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.CloseButton,
        elementId: props?.id,
        eventName: "OnClick"
    };
    
    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? "Close"}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? "ChromeClose"}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? "Close"}
            className={props.className} 
            customEvent={customEvent} 
            hideButtonTitle = {props.hideButtonTitle}/>
    );
}

export default CloseButton;