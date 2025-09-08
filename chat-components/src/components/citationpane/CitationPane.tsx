import { DefaultButton, IButtonStyles, IStackStyles, Label, Stack } from "@fluentui/react";
import { ElementType, EventNames } from "../../common/Constants";
import React, { useCallback } from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { ICitationPaneProps } from "./interfaces/ICitationPaneProps";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultCitationPaneCloseButtonStyles } from "./common/defaultStyles/defaultCitationPaneCloseButtonStyles";
import { defaultCitationPaneContentStyles } from "./common/defaultStyles/defaultCitationPaneContentStyles";
import { defaultCitationPaneControlProps } from "./common/defaultProps/defaultCitationPaneControlProps";
import { defaultCitationPaneGeneralStyles } from "./common/defaultStyles/defaultCitationPaneGeneralStyles";
import { defaultCitationPaneTitleStyles } from "./common/defaultStyles/defaultCitationPaneTitleStyles";

function CitationPane(props: ICitationPaneProps) {
    const elementId = props.controlProps?.id ?? defaultCitationPaneControlProps.id;

    const handleClose = useCallback(() => {
        if (props.controlProps?.onClose) {
            const customEvent = { 
                elementType: ElementType.CitationPaneCloseButton, 
                elementId: elementId + "-close", 
                eventName: EventNames.OnClick 
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onClose();
        }
    }, [props.controlProps, elementId]);

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultCitationPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const titleStyles: IButtonStyles = {
        root: Object.assign({}, defaultCitationPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const contentStyles: React.CSSProperties = {
        ...defaultCitationPaneContentStyles as React.CSSProperties,
        ...(props.styleProps?.contentStyleProps as React.CSSProperties)
    };

    const closeButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultCitationPaneCloseButtonStyles, props.styleProps?.closeButtonStyleProps)
    };

    return (
        <>
            <Stack 
                id={elementId} 
                role="dialog" 
                aria-labelledby={elementId + "-title"} 
                aria-describedby={elementId + "-content"} 
                dir={props.controlProps?.dir || defaultCitationPaneControlProps.dir}
                styles={containerStyles}
                className={props.styleProps?.classNames?.containerClassName}>

                {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                    <Label 
                        id={elementId + "-title"}
                        styles={titleStyles}
                        className={props.styleProps?.classNames?.titleClassName}>
                        {props.controlProps?.titleText || defaultCitationPaneControlProps.titleText}
                    </Label>
                )}

                <div 
                    id={elementId + "-content"} 
                    style={contentStyles}
                    className={props.styleProps?.classNames?.contentClassName}
                    dangerouslySetInnerHTML={{ __html: props.controlProps?.contentHtml ?? "" }} 
                />

                {!props.controlProps?.hideCloseButton && (decodeComponentString(props.componentOverrides?.closeButton) ||
                    <DefaultButton
                        onClick={handleClose} 
                        id={elementId + "-close"} 
                        text={props.controlProps?.closeButtonText || defaultCitationPaneControlProps.closeButtonText}
                        ariaLabel={props.controlProps?.closeButtonAriaLabel || defaultCitationPaneControlProps.closeButtonAriaLabel}
                        styles={closeButtonStyles}
                        className={props.styleProps?.classNames?.closeButtonClassName}
                    />
                )}
            </Stack>
        </>
    );
}

export default CitationPane;
