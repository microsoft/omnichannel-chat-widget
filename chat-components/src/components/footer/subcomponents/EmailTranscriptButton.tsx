import React from "react";
import { ElementType } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function EmailTranscriptButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.FooterEmailTranscriptButton,
        elementId: props?.id,
        eventName: "OnClick"
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? "Email Transcript"}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? "Mail"}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? "Email Transcript"}
            className={props.className}
            customEvent={customEvent} />
    );
}

export default EmailTranscriptButton;