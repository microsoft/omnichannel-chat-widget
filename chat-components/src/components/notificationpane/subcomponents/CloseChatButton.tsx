import React from "react";
import { AriaLabels, ElementType, EventNames, IconNames, Texts } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function CloseChatButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.NotificationCloseChatButton,
        elementId: props?.id,
        eventName: EventNames.OnClick
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? Texts.NotificationCloseChatText}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? IconNames.ChromeClose}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? AriaLabels.NotificationCloseChat}
            className={props.className}
            customEvent={customEvent}
            hideButtonTitle = {props.hideButtonTitle}/>
    );
}

export default CloseChatButton;