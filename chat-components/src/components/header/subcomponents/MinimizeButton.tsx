import React from "react";
import { AriaLabels, ElementType, EventNames, IconNames, Texts } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function MinimizeButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.HeaderMinimizeButton,
        elementId: props?.id,
        eventName: EventNames.OnClick
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? Texts.MinimizeText}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? IconNames.ChromeMinimize}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? AriaLabels.Minimize}
            className={props.className}
            customEvent={customEvent}/>
    );
}

export default MinimizeButton;