import React from "react";
import { ElementType } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function DownloadTranscriptButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.FooterDownloadTranscriptButton,
        elementId: props?.id,
        eventName: "OnClick"
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            text={props.text ?? "Download chat transcript"}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? "Download"}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? "Download chat transcript"}
            className={props.className} 
            customEvent={customEvent} />
    );
}

export default DownloadTranscriptButton;