import React from "react";
import { ElementType, EventNames } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function DismissButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.NotificationDismissButton,
        elementId: props?.id,
        eventName: EventNames.OnClick
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel}
            className={props.className}
            customEvent={customEvent}
            hideButtonTitle = {props.hideButtonTitle}/>
    );
}

export default DismissButton;