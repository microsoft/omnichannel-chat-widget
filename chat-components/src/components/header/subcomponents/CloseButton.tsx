import React from "react";
import { ElementType } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function CloseButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.HeaderCloseButton,
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
            iconName={props.iconName?? "ChromeClose"}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? "Close"}
            className={props.className} 
            customEvent={customEvent} />
    );
}

export default CloseButton;