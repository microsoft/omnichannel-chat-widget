import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { IButtonStyles, IStackStyles, Label, Stack } from "@fluentui/react";
import React, { useCallback } from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { ElementType, EventNames, KeyCodes } from "../../common/Constants";
import { IConfirmationPaneProps } from "./interfaces/IConfirmationPaneProps";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultConfirmationPaneButtonGroupStyles } from "./common/defaultStyles/defaultConfirmationPaneButtonGroupStyles";
import { defaultConfirmationPaneCancelButtonHoveredStyles } from "./common/defaultStyles/defaultConfirmationPaneCancelButtonHoveredStyles";
import { defaultConfirmationPaneCancelButtonStyles } from "./common/defaultStyles/defaultConfirmationPaneCancelButtonStyles";
import { defaultConfirmationPaneConfirmButtonHoveredStyles } from "./common/defaultStyles/defaultConfirmationPaneConfirmButtonHoveredStyles";
import { defaultConfirmationPaneConfirmButtonStyles } from "./common/defaultStyles/defaultConfirmationPaneConfirmButtonStyles";
import { defaultConfirmationPaneControlProps } from "./common/defaultProps/defaultConfirmationPaneControlProps";
import { defaultConfirmationPaneGeneralStyles } from "./common/defaultStyles/defaultConfirmationPaneGeneralStyles";
import { defaultConfirmationPaneSubtitleStyles } from "./common/defaultStyles/defaultConfirmationPaneSubtitleStyles";
import { defaultConfirmationPaneTitleStyles } from "./common/defaultStyles/defaultConfirmationPaneTitleStyles";
import { defaultConfirmationPaneConfirmButtonFocusedStyles } from "./common/defaultStyles/defaultConfirmationPaneConfirmButtonFocusedStyles";
import { defaultConfirmationPaneCancelButtonFocusedStyles } from "./common/defaultStyles/defaultConfirmationPaneCancelButtonFocusedStyles";

function ConfirmationPane(props: IConfirmationPaneProps) {

    const elementId = props.controlProps?.id ?? defaultConfirmationPaneControlProps.id;

    const handleConfirmClick = useCallback(() => {
        if (props.controlProps?.onConfirm) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.ConfirmationPaneConfirmButton,
                elementId: elementId + "-confirmbutton",
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onConfirm();
        }
    }, []);

    const handleCancelClick = useCallback(() => {
        if (props.controlProps?.onCancel) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.ConfirmationPaneCancelButton,
                elementId: elementId + "-cancelbutton",
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onCancel();
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEscKeyDown = useCallback((e: any) => {
        if (e.code === KeyCodes.ESCAPE) {
            handleCancelClick();
        }
    }, []);

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultConfirmationPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const titleStyles: IButtonStyles = {
        root: Object.assign({}, defaultConfirmationPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const subtitleStyles: IButtonStyles = {
        root: Object.assign({}, defaultConfirmationPaneSubtitleStyles, props.styleProps?.subtitleStyleProps)
    };

    const buttonGroupStyles: IStackStyles = {
        root: Object.assign({}, defaultConfirmationPaneButtonGroupStyles, props.styleProps?.buttonGroupStyleProps)
    };

    const confirmButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultConfirmationPaneConfirmButtonStyles, props.styleProps?.confirmButtonStyleProps),
        rootHovered: Object.assign({}, defaultConfirmationPaneConfirmButtonHoveredStyles, props.styleProps?.confirmButtonHoveredStyleProps),
        rootFocused: Object.assign({}, defaultConfirmationPaneConfirmButtonFocusedStyles, props.styleProps?.confirmButtonFocusedStyleProps),
        rootPressed: Object.assign({}, defaultConfirmationPaneConfirmButtonHoveredStyles, props.styleProps?.confirmButtonHoveredStyleProps),
    };

    const cancelButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultConfirmationPaneCancelButtonStyles, props.styleProps?.cancelButtonStyleProps),
        rootHovered: Object.assign({}, defaultConfirmationPaneCancelButtonHoveredStyles, props.styleProps?.cancelButtonHoveredStyleProps),
        rootFocused: Object.assign({}, defaultConfirmationPaneCancelButtonFocusedStyles, props.styleProps?.cancelButtonFocusedStyleProps),
        rootPressed: Object.assign({}, defaultConfirmationPaneCancelButtonHoveredStyles, props.styleProps?.cancelButtonHoveredStyleProps)
    };

    return (
        <>
            {!props.controlProps?.hideConfirmationPane &&
                <Stack
                    id={elementId}
                    onKeyDown={handleEscKeyDown}
                    tabIndex={-1}
                    dir={props.controlProps?.dir || defaultConfirmationPaneControlProps.dir}
                    styles={containerStyles}
                    role="dialog"
                    aria-labelledby={elementId + "-title"}
                    aria-describedby={elementId + "-subtitle"}>

                    {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                        <Label
                            className={props.styleProps?.classNames?.titleClassName}
                            styles={titleStyles}
                            tabIndex={-1}
                            id={elementId + "-title"}>
                            {props.controlProps?.titleText || defaultConfirmationPaneControlProps.titleText}
                        </Label>)}

                    {!props.controlProps?.hideSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) ||
                        <Label
                            className={props.styleProps?.classNames?.subtitleClassName}
                            styles={subtitleStyles}
                            tabIndex={-1}
                            id={elementId + "-subtitle"}>
                            {props.controlProps?.subtitleText || defaultConfirmationPaneControlProps.subtitleText}
                        </Label>)}

                    <Stack horizontal
                        className={props.styleProps?.classNames?.buttonGroupClassName}
                        styles={buttonGroupStyles}
                        id={elementId + "-buttongroup"}>
                        {!props.controlProps?.hideConfirmButton && (decodeComponentString(props.componentOverrides?.confirmButton) ||
                            <PrimaryButton
                                className={props.styleProps?.classNames?.confirmButtonClassName}
                                styles={confirmButtonStyles}
                                text={props.controlProps?.confirmButtonText || defaultConfirmationPaneControlProps.confirmButtonText}
                                onClick={handleConfirmClick}
                                id={elementId + "-confirmbutton"}
                                ariaLabel={props.controlProps?.confirmButtonAriaLabel || defaultConfirmationPaneControlProps.confirmButtonAriaLabel}
                            />)}

                        {!props.controlProps?.hideCancelButton && (decodeComponentString(props.componentOverrides?.cancelButton) ||
                            <DefaultButton
                                className={props.styleProps?.classNames?.cancelButtonClassName}
                                styles={cancelButtonStyles}
                                text={props.controlProps?.cancelButtonText || defaultConfirmationPaneControlProps.cancelButtonText}
                                onClick={handleCancelClick}
                                id={elementId + "-cancelbutton"}
                                ariaLabel={props.controlProps?.cancelButtonAriaLabel || defaultConfirmationPaneControlProps.cancelButtonAriaLabel}
                            />)}
                    </Stack>
                </Stack>
            }
        </>
    );
}

export default ConfirmationPane;