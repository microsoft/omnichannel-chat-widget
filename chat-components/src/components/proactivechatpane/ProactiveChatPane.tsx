import { IButtonStyles, IStackStyles, Label, Stack } from "@fluentui/react";
import React, { useCallback } from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { DefaultButton } from "@fluentui/react/lib/Button";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import CloseButton from "../common/subcomponents/CloseButton";
import { IProactiveChatPaneProps } from "./interfaces/IProactiveChatPaneProps";
import { KeyCodes } from "../../common/Constants";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultProactiveChatPaneBodyContainerStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneBodyContainerStyles";
import { defaultProactiveChatPaneBodyTitleStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneBodyTitleStyles";
import { defaultProactiveChatPaneControlProps } from "./common/default/defaultProps/defaultProactiveChatPaneControlProps";
import { defaultProactiveChatPaneGeneralStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneGeneralStyles";
import { defaultProactiveChatPaneHeaderContainerStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneHeaderContainerStyles";
import { defaultProactiveChatPaneStartButtonHoveredStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneStartButtonHoveredStyles";
import { defaultProactiveChatPaneStartButtonStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneStartButtonStyles";
import { defaultProactiveChatPaneSubtitleStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneSubtitleStyles";
import { defaultProactiveChatPaneTextContainerStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneTextContainerStyles";
import { defaultProactiveChatPaneTitleStyles } from "./common/default/defaultStyles/defaultProactiveChatPaneTitleStyles";
import { generateEventName } from "../../common/utils";
import { defaultProactiveChatPaneProps } from "./common/default/defaultProps/defaultProactiveChatPaneProps";

function ProactiveChatPane(props: IProactiveChatPaneProps) {

    const elementId = props.controlProps?.id ?? defaultProactiveChatPaneControlProps.id;

    const close = (controlId: string, suffix: string) => {
        if (props.controlProps?.onClose) {
            const performance = window.performance;
            const startTime = performance.now();

            props.controlProps?.onClose();

            const endTime = performance.now();
            const payload = {elapsedTimeInMilliseconds: endTime - startTime};
            const eventName = generateEventName(controlId, "on", suffix);
            const customEvent: ICustomEvent = { eventName: eventName + " - Proactive Chat Rejected", payload: payload};
            BroadcastService.postMessage(customEvent);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEscKeyDown = useCallback((e: any) => {
        if (e.code === KeyCodes.ESCAPE) {
            close(elementId as string, "KeyDown");
        }
    }, []);

    const handleCloseClick = useCallback(() => {
        close(elementId + "-closebutton", "Click");
    }, []);

    const handleStartClick = useCallback(() => {
        if (props.controlProps?.onStart) {
            const onClickEventName = generateEventName(elementId + "-startbutton", "on", "Click");
            const onClickEvent: ICustomEvent = { eventName: onClickEventName + " - Proactive Chat Accepted" };
            BroadcastService.postMessage(onClickEvent);
            props.controlProps?.onStart();
        }
    }, []);

    const closeButtonProps = Object.assign({}, defaultProactiveChatPaneProps.controlProps?.closeButtonProps,
        props.controlProps?.closeButtonProps);

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultProactiveChatPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const headerContainerStyles: IStackStyles = {
        root: Object.assign({}, defaultProactiveChatPaneHeaderContainerStyles, props.styleProps?.headerContainerStyleProps)
    };

    const textContainerStyles: IStackStyles = {
        root: Object.assign({}, defaultProactiveChatPaneTextContainerStyles, props.styleProps?.textContainerStyleProps)
    };

    const titleStyles: IButtonStyles = {
        root: Object.assign({}, defaultProactiveChatPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const subtitleStyles: IButtonStyles = {
        root: Object.assign({}, defaultProactiveChatPaneSubtitleStyles, props.styleProps?.subtitleStyleProps)
    };

    const closeButtonStyles = Object.assign({}, defaultProactiveChatPaneProps.styleProps?.closeButtonStyleProps,
        props.styleProps?.closeButtonStyleProps);

    const closeButtonHoverStyles = Object.assign({}, defaultProactiveChatPaneProps.styleProps?.closeButtonHoveredStyleProps,
        props.styleProps?.closeButtonHoveredStyleProps);

    const bodyContainerStyles: IStackStyles = {
        root: Object.assign({}, defaultProactiveChatPaneBodyContainerStyles, props.styleProps?.bodyContainerStyleProps)
    };

    const bodyTitleStyles: IButtonStyles = {
        root: Object.assign({}, defaultProactiveChatPaneBodyTitleStyles, props.styleProps?.bodyTitleStyleProps)
    };

    const startButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultProactiveChatPaneStartButtonStyles, props.styleProps?.startButtonStyleProps),
        rootHovered: Object.assign({}, defaultProactiveChatPaneStartButtonHoveredStyles, props.styleProps?.startButtonHoveredStyleProps),
        rootPressed: Object.assign({}, defaultProactiveChatPaneStartButtonHoveredStyles, props.styleProps?.startButtonHoveredStyleProps)
    };

    return (
        <>
            {!props.controlProps?.hideProactiveChatPane && 
                <Stack 
                    className={props.styleProps?.classNames?.containerClassName}
                    id={elementId}
                    tabIndex={-1}
                    onKeyDown={handleEscKeyDown}
                    dir={props.controlProps?.dir || defaultProactiveChatPaneControlProps.dir}
                    aria-label={props.controlProps?.proactiveChatPaneAriaLabel || defaultProactiveChatPaneControlProps.proactiveChatPaneAriaLabel}
                    styles={containerStyles}>
                    <Stack horizontal={true}
                        className={props.styleProps?.classNames?.headerContainerClassName}
                        styles={headerContainerStyles}
                        tabIndex={-1}
                        id={elementId + "-headercontainer"}>
                        <Stack
                            className={props.styleProps?.classNames?.textContainerClassName}
                            styles={textContainerStyles}
                            tabIndex={-1}
                            id={elementId + "-textcontainer"}>

                            {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                            <Label
                                className={props.styleProps?.classNames?.titleClassName}
                                styles={titleStyles}
                                tabIndex={-1}
                                id={elementId + "-title"}>
                                {props.controlProps?.titleText || defaultProactiveChatPaneControlProps.titleText}
                            </Label>) }

                            {!props.controlProps?.hideSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) ||
                            <Label
                                className={props.styleProps?.classNames?.subtitleClassName}
                                styles={subtitleStyles}
                                tabIndex={-1}
                                id={elementId + "-subtitle"}>
                                {props.controlProps?.subtitleText || defaultProactiveChatPaneControlProps.subtitleText}
                            </Label>) }
                        </Stack>

                        {!props.controlProps?.hideCloseButton && (decodeComponentString(props.componentOverrides?.closeButton) ||
                        <CloseButton
                            {...closeButtonProps}
                            className={props.styleProps?.classNames?.closeButtonClassName}
                            onClick={handleCloseClick}
                            styles={closeButtonStyles}
                            hoverStyles={closeButtonHoverStyles}
                            id={elementId + "-closebutton"}/>) }
                    </Stack>
                    <Stack horizontal={props.controlProps?.isBodyContainerHorizantal || defaultProactiveChatPaneControlProps.isBodyContainerHorizantal}
                        className={props.styleProps?.classNames?.bodyContainerClassName}
                        styles={bodyContainerStyles}
                        tabIndex={-1}
                        id={elementId + "-bodycontainer"}>
                        {!props.controlProps?.hideBodyTitle && (decodeComponentString(props.componentOverrides?.bodyTitle) ||
                            <Label
                                className={props.styleProps?.classNames?.bodyTitleClassName}
                                styles={bodyTitleStyles}
                                tabIndex={-1}
                                id={elementId + "-bodytitle"}>
                                {props.controlProps?.bodyTitleText || defaultProactiveChatPaneControlProps.bodyTitleText}
                            </Label>)}

                        {!props.controlProps?.hideStartButton && (decodeComponentString(props.componentOverrides?.startButton) || 
                            <DefaultButton
                                className={props.styleProps?.classNames?.startButtonClassName}
                                styles={startButtonStyles}
                                tabIndex={0}
                                text={props.controlProps?.startButtonText || defaultProactiveChatPaneControlProps.startButtonText}
                                onClick={handleStartClick}
                                id={elementId + "-startbutton"}
                                aria-label={props.controlProps?.startButtonAriaLabel || defaultProactiveChatPaneControlProps.startButtonAriaLabel}
                            />)}
                    </Stack>
                </Stack>
            }
        </>
    );
}

export default ProactiveChatPane;