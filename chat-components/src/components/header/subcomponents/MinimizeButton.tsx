import React from "react";
import { ElementType } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function MinimizeButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.HeaderMinimizeButton,
        elementId: props?.id,
        eventName: "OnClick"
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? "Minimize"}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? "ChromeMinimize"}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? "Minimize"}
            className={props.className}
            customEvent={customEvent} />
    );
}

export default MinimizeButton;