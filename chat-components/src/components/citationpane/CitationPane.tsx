import { DefaultButton, IButtonStyles, IStackStyles, IconButton, Label, Stack } from "@fluentui/react";
import { ElementType, EventNames, KeyCodes } from "../../common/Constants";
import React, { useCallback } from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { ICitationPaneProps } from "./interfaces/ICitationPaneProps";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultCitationPaneCloseButtonFocusedStyles } from "./common/defaultStyles/defaultCitationPaneCloseButtonFocusedStyles";
import { defaultCitationPaneCloseButtonHoveredStyles } from "./common/defaultStyles/defaultCitationPaneCloseButtonHoveredStyles";
import { defaultCitationPaneCloseButtonStyles } from "./common/defaultStyles/defaultCitationPaneCloseButtonStyles";
import { defaultCitationPaneContentStyles } from "./common/defaultStyles/defaultCitationPaneContentStyles";
import { defaultCitationPaneControlProps } from "./common/defaultProps/defaultCitationPaneControlProps";
import { defaultCitationPaneGeneralStyles } from "./common/defaultStyles/defaultCitationPaneGeneralStyles";
import { defaultCitationPaneTitleStyles } from "./common/defaultStyles/defaultCitationPaneTitleStyles";
import { defaultCitationPaneTopCloseButtonFocusedStyles } from "./common/defaultStyles/defaultCitationPaneTopCloseButtonFocusedStyles";
import { defaultCitationPaneTopCloseButtonHoveredStyles } from "./common/defaultStyles/defaultCitationPaneTopCloseButtonHoveredStyles";
import { defaultCitationPaneTopCloseButtonStyles } from "./common/defaultStyles/defaultCitationPaneTopCloseButtonStyles";

function CitationPane(props: ICitationPaneProps) {
    const elementId = props.controlProps?.id ?? defaultCitationPaneControlProps.id;

    const handleClose = useCallback(() => {
        if (props.controlProps?.onClose) {
            const customEvent: ICustomEvent = { 
                elementType: ElementType.CitationPaneCloseButton, 
                elementId: elementId + "-close", 
                eventName: EventNames.OnClick 
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onClose();
        }
    }, [props.controlProps, elementId]);

    const handleTopClose = useCallback(() => {
        if (handleClose) {
            const customEvent: ICustomEvent = { 
                elementType: ElementType.CitationPaneCloseButton, 
                elementId: elementId + "-top-close", 
                eventName: EventNames.OnClick 
            };
            BroadcastService.postMessage(customEvent);
            handleClose();
        }
    }, [props.controlProps, elementId]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEscKeyDown = useCallback((e: any) => {
        if (e.code === KeyCodes.ESCAPE) {
            handleClose();
        }
    }, [handleClose]);

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultCitationPaneGeneralStyles, props.styleProps?.generalStyleProps, {
            position: "relative" // Ensure container is positioned for absolute positioning of top close button
        })
    };

    const titleStyles: IButtonStyles = {
        root: Object.assign({}, defaultCitationPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const contentStyles: React.CSSProperties = {
        ...defaultCitationPaneContentStyles as React.CSSProperties,
        ...(props.styleProps?.contentStyleProps as React.CSSProperties)
    };

    const closeButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultCitationPaneCloseButtonStyles, props.styleProps?.closeButtonStyleProps),
        rootHovered: Object.assign({}, defaultCitationPaneCloseButtonHoveredStyles, props.styleProps?.closeButtonHoveredStyleProps),
        rootFocused: Object.assign({}, defaultCitationPaneCloseButtonFocusedStyles, props.styleProps?.closeButtonFocusedStyleProps),
        rootPressed: Object.assign({}, defaultCitationPaneCloseButtonHoveredStyles, props.styleProps?.closeButtonHoveredStyleProps)
    };

    const topCloseButtonPosition = props.controlProps?.topCloseButtonPosition || defaultCitationPaneControlProps.topCloseButtonPosition;
    
    const topCloseButtonStyles: IButtonStyles = {
        root: Object.assign({}, 
            defaultCitationPaneTopCloseButtonStyles, 
            props.styleProps?.topCloseButtonStyleProps,
            topCloseButtonPosition === "topLeft" ? { left: "0.5em", right: "auto" } : { right: "0.5em", left: "auto" }
        ),
        rootHovered: Object.assign({}, defaultCitationPaneTopCloseButtonHoveredStyles, props.styleProps?.topCloseButtonHoveredStyleProps),
        rootFocused: Object.assign({}, defaultCitationPaneTopCloseButtonFocusedStyles, props.styleProps?.topCloseButtonFocusedStyleProps),
        rootPressed: Object.assign({}, defaultCitationPaneTopCloseButtonHoveredStyles, props.styleProps?.topCloseButtonHoveredStyleProps)
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
                className={props.styleProps?.classNames?.containerClassName}
                onKeyDown={handleEscKeyDown}
                tabIndex={-1}>

                {/* Top Close Button (X) */}
                {!props.controlProps?.hideTopCloseButton && (decodeComponentString(props.componentOverrides?.topCloseButton) ||
                    <IconButton
                        onClick={handleTopClose}
                        id={elementId + "-top-close"}
                        iconProps={{ iconName: "ChromeClose" }}
                        ariaLabel={props.controlProps?.topCloseButtonAriaLabel || defaultCitationPaneControlProps.topCloseButtonAriaLabel}
                        styles={topCloseButtonStyles}
                        className={props.styleProps?.classNames?.topCloseButtonClassName}
                    />
                )}

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

                {/* Bottom Close Button - Hidden at high zoom levels for better A11Y */}
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