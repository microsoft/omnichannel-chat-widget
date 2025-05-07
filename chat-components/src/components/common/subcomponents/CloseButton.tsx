import React from "react";
import { AriaLabels, ElementType, EventNames, IconNames, Texts } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../commandbutton/CommandButton";
import { ICommandButtonProps } from "../interfaces/ICommandButtonProps";

function CloseButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.CloseButton,
        elementId: props?.id,
        eventName: EventNames.OnClick
    };
    
    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? Texts.CloseButtonText}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? IconNames.ChromeClose}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? AriaLabels.Close}
            className={props.className} 
            customEvent={customEvent}/>
    );
}

export default CloseButton;