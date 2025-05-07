import { DefaultButton, PrimaryButton } from "@fluentui/react/lib/Button";
import { IButtonStyles, ILabelStyles, IStackStyles, IStyle, ITextFieldStyles, Label, Stack, TextField } from "@fluentui/react";
import React, {CSSProperties, useCallback, useEffect, useState} from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { IInputValidationPaneProps } from "./interfaces/IInputValidationPaneProps";
import { KeyCodes } from "../../common/Constants";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultInputValidationPaneButtonGroupStyles } from "./common/default/defaultStyles/defaultInputValidationPaneButtonGroupStyles";
import { defaultInputValidationPaneCancelButtonHoveredStyles } from "./common/default/defaultStyles/defaultInputValidationPaneCancelButtonHoveredStyles";
import { defaultInputValidationPaneCancelButtonStyles } from "./common/default/defaultStyles/defaultInputValidationPaneCancelButtonStyles";
import { defaultInputValidationPaneControlProps } from "./common/default/defaultProps/defaultInputValidationPaneControlProps";
import { defaultInputValidationPaneGeneralStyles } from "./common/default/defaultStyles/defaultInputValidationPaneGeneralStyles";
import { defaultInputValidationPaneHeaderGroupStyles } from "./common/default/defaultStyles/defaultInputValidationPaneHeaderGroupStyles";
import { defaultInputValidationPaneInputStyles } from "./common/default/defaultStyles/defaultInputValidationPaneInputStyles";
import { defaultInputValidationPaneInvalidInputErrorMessageStyles } from "./common/default/defaultStyles/defaultInputValidationPaneInvalidInputErrorMessageStyles";
import { defaultInputValidationPaneSendButtonHoveredStyles } from "./common/default/defaultStyles/defaultInputValidationPaneSendButtonHoveredStyles";
import { defaultInputValidationPaneSendButtonStyles } from "./common/default/defaultStyles/defaultInputValidationPaneSendButtonStyles";
import { defaultInputValidationPaneSubtitleStyles } from "./common/default/defaultStyles/defaultInputValidationPaneSubtitleStyles";
import { defaultInputValidationPaneTitleStyles } from "./common/default/defaultStyles/defaultInputValidationPaneTitleStyles";
import { generateEventName } from "../../common/utils";

function InputValidationPane(props: IInputValidationPaneProps) {

    const elementId = props.controlProps?.id ?? defaultInputValidationPaneControlProps.id;

    const [inputValue, setInputValue] = useState("");
    const [isInitialRendering, setIsInitialRendering] = useState(true);
    const [isInvalidInput, setIsInvalidInput] = useState(false);
    const [isSendButtonEnabled, setIsSendButtonEnabled] = useState(false);
    
    const isValidInput = useCallback(() => {
        if (!props.controlProps?.checkInput) {
            return true;
        }
        if (!inputValue) {
            return false;
        }
        return props.controlProps?.checkInput(inputValue);
    }, [inputValue]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputChange = useCallback((e: any) => {
        setInputValue(e.target.value);

        e.target.value ? setIsSendButtonEnabled(props.controlProps?.enableSendButton || e.target.value !== "")
            : setIsSendButtonEnabled(props.controlProps?.enableSendButton ?? false);

        setIsInvalidInput(false);
    }, []);

    const send = useCallback((controlId: string, suffix: string) => {
        if (props.controlProps?.onSend) {
            if (isValidInput()) {
                const eventName = generateEventName(controlId, "on", suffix);
                const customEvent: ICustomEvent = { eventName: eventName };
                BroadcastService.postMessage(customEvent);

                props.controlProps?.onSend(inputValue);
            }
            else {
                setIsInvalidInput(true);
            }
        }
    }, [inputValue]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputKeyUp = useCallback((e: any) => {
        if (e.code === KeyCodes.ENTER) {
            send(elementId + "-textField", "KeyUp");
        }
    }, [inputValue]);

    const handleSendClick = useCallback(() => {
        send(elementId + "-sendbutton", "Click");
    }, [inputValue]);

    const cancel = useCallback((controlId: string, suffix: string) => {
        if (props.controlProps?.onCancel) {
            setInputValue("");
            setIsInvalidInput(false);
            setIsSendButtonEnabled(props.controlProps?.enableSendButton ?? false);
            
            const eventName = generateEventName(controlId, "on", suffix);
            const customEvent: ICustomEvent = { eventName: eventName };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onCancel();
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEscKeyDown = useCallback((e: any) => {
        if (e.code === KeyCodes.ESCAPE) {
            cancel(elementId as string, "KeyDown");
        }
    }, []);

    const handleCancelClick = useCallback(() => {
        cancel(elementId + "-cancelbutton", "Click");
    }, []);

    useEffect(() => {
        setInputValue(props.controlProps?.inputInitialText ?? "");

        const isInputEmpty = props.controlProps?.inputInitialText ? false : true;
        setIsSendButtonEnabled(props.controlProps?.enableSendButton || !isInputEmpty);
        
        if (isInitialRendering) {
            setIsInitialRendering(!isInitialRendering);
        }
    }, [isInitialRendering]);

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultInputValidationPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const headerGroupStyles: IStackStyles = {
        root: Object.assign({}, defaultInputValidationPaneHeaderGroupStyles, props.styleProps?.headerGroupStyleProps)
    };

    const titleStyles = Object.assign({}, defaultInputValidationPaneTitleStyles, props.styleProps?.titleStyleProps);


    const subtitleStyles: ILabelStyles = {
        root: Object.assign({}, defaultInputValidationPaneSubtitleStyles, props.styleProps?.subtitleStyleProps)
    };

    const redBorderStyles: IStyle = {
        borderColor: props.controlProps?.inputWithErrorMessageBorderColor ?? defaultInputValidationPaneControlProps.inputWithErrorMessageBorderColor,
        borderRadius: "1px",
        borderStyle: "solid",
        borderWidth: "1px"
    };

    const inputStyles: ITextFieldStyles = {
        root: Object.assign({}, defaultInputValidationPaneInputStyles, props.styleProps?.inputStyleProps),
        field: Object.assign({}, defaultInputValidationPaneInputStyles, props.styleProps?.inputStyleProps),
        fieldGroup: undefined,
        prefix: undefined,
        suffix: undefined,
        icon: undefined,
        description: undefined,
        wrapper: undefined,
        errorMessage: undefined,
        subComponentStyles: {
            label: {}
        },
        revealButton: undefined,
        revealSpan: undefined,
        revealIcon: undefined
    };

    const inputWithErrorMessageStyles: ITextFieldStyles = {
        root: Object.assign({}, defaultInputValidationPaneInputStyles, redBorderStyles, props.styleProps?.inputStyleProps),
        field: Object.assign({}, defaultInputValidationPaneInputStyles, redBorderStyles, props.styleProps?.inputStyleProps),
        fieldGroup: undefined,
        prefix: undefined,
        suffix: undefined,
        icon: undefined,
        description: undefined,
        wrapper: undefined,
        errorMessage: undefined,
        subComponentStyles: {
            label: {}
        },
        revealButton: undefined,
        revealSpan: undefined,
        revealIcon: undefined
    };

    const invalidInputErrorMessageStyles: IStackStyles = {
        root: Object.assign({}, defaultInputValidationPaneInvalidInputErrorMessageStyles, props.styleProps?.invalidInputErrorMessageStyleProps)
    };

    const buttonGroupStyles: IStackStyles = {
        root: Object.assign({}, defaultInputValidationPaneButtonGroupStyles, props.styleProps?.buttonGroupStyleProps)
    };

    const sendButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultInputValidationPaneSendButtonStyles, props.styleProps?.sendButtonStyleProps),
        rootHovered: Object.assign({}, defaultInputValidationPaneSendButtonHoveredStyles, props.styleProps?.sendButtonHoveredStyleProps),
        rootPressed: Object.assign({}, defaultInputValidationPaneSendButtonHoveredStyles, props.styleProps?.sendButtonHoveredStyleProps)
    };

    const cancelButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultInputValidationPaneCancelButtonStyles, props.styleProps?.cancelButtonStyleProps),
        rootHovered: Object.assign({}, defaultInputValidationPaneCancelButtonHoveredStyles, props.styleProps?.cancelButtonHoveredStyleProps),
        rootPressed: Object.assign({}, defaultInputValidationPaneCancelButtonHoveredStyles, props.styleProps?.cancelButtonHoveredStyleProps)
    };

    return (
        <>
            {!props.controlProps?.hideInputValidationPane && 
                <Stack 
                    className={props.styleProps?.classNames?.containerClassName}
                    id={elementId}
                    tabIndex={-1}
                    onKeyDown={handleEscKeyDown}
                    dir={props.controlProps?.dir || defaultInputValidationPaneControlProps.dir}
                    aria-label={props.controlProps?.inputValidationPaneAriaLabel || defaultInputValidationPaneControlProps.inputValidationPaneAriaLabel}
                    styles={containerStyles}>

                    <Stack
                        className={props.styleProps?.classNames?.headerGroupClassName}
                        styles={headerGroupStyles}
                        tabIndex={-1}
                        id={elementId + "-headergroup"}>

                        {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                        <h1
                            className={props.styleProps?.classNames?.titleClassName}
                            style={titleStyles as CSSProperties}
                            tabIndex={-1}
                            id={elementId + "-title"}>
                            {props.controlProps?.titleText || defaultInputValidationPaneControlProps.titleText}
                        </h1>) }

                        {!props.controlProps?.hideSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) ||
                        <Label
                            className={props.styleProps?.classNames?.subtitleClassName}
                            styles={subtitleStyles}
                            tabIndex={-1}
                            id={elementId + "-subtitle"}>
                            {props.controlProps?.subtitleText || defaultInputValidationPaneControlProps.subtitleText}
                        </Label>) }
                            
                        {!props.controlProps?.hideInput && (decodeComponentString(props.componentOverrides?.input) ||
                        <TextField
                            className={props.styleProps?.classNames?.inputClassName}
                            styles={isInvalidInput ? inputWithErrorMessageStyles : inputStyles}
                            tabIndex={0}
                            value={inputValue ?? defaultInputValidationPaneControlProps.inputInitialText}
                            id={props.controlProps?.inputId ?? defaultInputValidationPaneControlProps.inputId}
                            ariaLabel={props.controlProps?.inputAriaLabel || defaultInputValidationPaneControlProps.inputAriaLabel}
                            borderless={isInvalidInput}
                            onChange={handleInputChange}
                            onKeyUp={handleInputKeyUp}
                            placeholder={props.controlProps?.inputPlaceHolder || defaultInputValidationPaneControlProps.inputPlaceHolder}
                        />) }

                        { isInvalidInput && (decodeComponentString(props.componentOverrides?.invalidInputErrorMessage) ||
                        <Stack
                            className={props.styleProps?.classNames?.invalidInputErrorMessageClassName}
                            styles={invalidInputErrorMessageStyles}
                            aria-label={props.controlProps?.invalidInputErrorMessageText || defaultInputValidationPaneControlProps.invalidInputErrorMessageText}
                            tabIndex={-1}
                            role={"alert"}
                            id={elementId + "-invalidinputerrormessage"}>
                            {props.controlProps?.invalidInputErrorMessageText || defaultInputValidationPaneControlProps.invalidInputErrorMessageText}
                        </Stack>) }
                    </Stack>

                    <Stack horizontal={props.controlProps?.isButtonGroupHorizontal ?? defaultInputValidationPaneControlProps.isButtonGroupHorizontal}
                        className={props.styleProps?.classNames?.buttonGroupClassName}
                        styles={buttonGroupStyles}
                        tabIndex={-1}
                        id={elementId + "-buttongroup"}>

                        {!props.controlProps?.hideSendButton && (decodeComponentString(props.componentOverrides?.sendButton) ||
                            <PrimaryButton
                                className={props.styleProps?.classNames?.sendButtonClassName}
                                styles={sendButtonStyles}
                                title={props.controlProps?.sendButtonText || defaultInputValidationPaneControlProps.sendButtonText}
                                tabIndex={0}
                                disabled={!isSendButtonEnabled}
                                text={props.controlProps?.sendButtonText || defaultInputValidationPaneControlProps.sendButtonText}
                                onClick={handleSendClick}
                                id={elementId + "-sendbutton"}
                                ariaLabel={props.controlProps?.sendButtonAriaLabel || defaultInputValidationPaneControlProps.sendButtonAriaLabel}
                            >
                            </PrimaryButton>)}

                        {!props.controlProps?.hideCancelButton && (decodeComponentString(props.componentOverrides?.cancelButton) || 
                            <DefaultButton
                                className={props.styleProps?.classNames?.cancelButtonClassName}
                                styles={cancelButtonStyles}
                                title={props.controlProps?.cancelButtonText || defaultInputValidationPaneControlProps.cancelButtonText}
                                tabIndex={0}
                                text={props.controlProps?.cancelButtonText || defaultInputValidationPaneControlProps.cancelButtonText}
                                onClick={handleCancelClick}
                                id={elementId + "-cancelbutton"}
                                ariaLabel={props.controlProps?.cancelButtonAriaLabel || defaultInputValidationPaneControlProps.cancelButtonAriaLabel}
                            />)}
                    </Stack>
                </Stack>
            }
        </>
    );
}

export default InputValidationPane;