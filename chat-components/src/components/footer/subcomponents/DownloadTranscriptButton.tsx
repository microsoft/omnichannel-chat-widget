import React from "react";
import { AriaLabels, ElementType, EventNames, IconNames } from "../../../common/Constants";
import { ICustomEvent } from "../../../interfaces/ICustomEvent";
import CommandButton from "../../common/commandbutton/CommandButton";
import { ICommandButtonProps } from "../../common/interfaces/ICommandButtonProps";

function DownloadTranscriptButton(props: ICommandButtonProps) {
    const { type } = props;
    const customEvent: ICustomEvent = {
        elementType: ElementType.FooterDownloadTranscriptButton,
        elementId: props?.id,
        eventName: EventNames.OnClick
    };

    return (
        <CommandButton
            id={props?.id}
            type={type}
            styles={props.styles}
            hoverStyles={props.hoverStyles}
            focusStyles={props.focusStyles}
            iconName={props.iconName ?? IconNames.Download}
            imageIconProps={props.imageIconProps}
            onClick={props.onClick}
            ariaLabel={props.ariaLabel ?? AriaLabels.DownloadChatTranscript}
            className={props.className} 
            customEvent={customEvent}/>
    );
}

export default DownloadTranscriptButton;