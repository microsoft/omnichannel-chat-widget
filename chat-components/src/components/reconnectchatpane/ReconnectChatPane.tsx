import { DefaultButton, IButtonStyles, IStackStyles, Icon, Label, Stack } from "@fluentui/react";
import React, { useCallback } from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { ElementType, EventNames } from "../../common/Constants";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { IReconnectChatPaneProps } from "./interfaces/IReconnectChatPaneProps";
import { KeyCodes } from "../../common/Constants";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultReconnectChatPaneButtonGroupStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneButtonGroupStyles";
import { defaultReconnectChatPaneContinueChatButtonHoveredStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneContinueChatButtonHoveredStyles";
import { defaultReconnectChatPaneContinueChatButtonStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneContinueChatButtonStyles";
import { defaultReconnectChatPaneControlProps } from "./common/default/defaultProps/defaultReconnectChatPaneControlProps";
import { defaultReconnectChatPaneGeneralStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneGeneralStyles";
import { defaultReconnectChatPaneIconStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneIconStyles";
import { defaultReconnectChatPaneStartNewChatButtonHoveredStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneStartNewChatButtonHoveredStyles";
import { defaultReconnectChatPaneStartNewChatButtonStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneStartNewChatButtonStyles";
import { defaultReconnectChatPaneSubtitleStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneSubtitleStyles";
import { defaultReconnectChatPaneTitleStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneTitleStyles";
import { defaultReconnectChatPaneWrapperStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneWrapperStyles";
import { defaultReconnectChatPaneContinueChatFocusedStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneContinueChatButtonFocusedStyles";
import { defaultReconnectChatPaneStartChatFocusedStyles } from "./common/default/defaultStyles/defaultReconnectChatPaneStartChatButtonFocusedStyles";

function ReconnectChatPane(props: IReconnectChatPaneProps) {

    const elementId = props.controlProps?.id ?? defaultReconnectChatPaneControlProps.id;

    const handleContinueChatClick = useCallback(() => {
        if (props.controlProps?.onContinueChat) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.ReconnectChatContinueChatButton,
                elementId: elementId + "-continueconversationbutton",
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onContinueChat();
        }
    }, []);

    const handleStartNewChatClick = useCallback(() => {
        if (props.controlProps?.onStartNewChat) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.ReconnectChatStartNewChatButton,
                elementId: elementId + "-startnewconversationbutton",
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onStartNewChat();
        }
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleEscKeyDown = useCallback((e: any) => {
        if (e.code === KeyCodes.ESCAPE && props.controlProps?.onMinimize) {
            const customEvent: ICustomEvent = {
                elementType: ElementType.ReconnectChatPane,
                elementId: elementId,
                eventName: EventNames.OnEscapeKeyDown
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps?.onMinimize();
        }
    }, []);

    const containerStyles: IStackStyles = {
        root: Object.assign({}, defaultReconnectChatPaneGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const wrapperStyles: IStackStyles = {
        root: Object.assign({}, defaultReconnectChatPaneWrapperStyles, props.styleProps?.wrapperStyleProps)
    };

    const titleStyles: IButtonStyles = {
        root: Object.assign({}, defaultReconnectChatPaneTitleStyles, props.styleProps?.titleStyleProps)
    };

    const subtitleStyles: IButtonStyles = {
        root: Object.assign({}, defaultReconnectChatPaneSubtitleStyles, props.styleProps?.subtitleStyleProps)
    };

    const iconStyles: IButtonStyles = {
        root: Object.assign({}, defaultReconnectChatPaneIconStyles, props.styleProps?.iconStyleProps)
    };

    const buttonGroupStyles: IStackStyles = {
        root: Object.assign({}, defaultReconnectChatPaneButtonGroupStyles, props.styleProps?.buttonGroupStyleProps)
    };

    const continueChatButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultReconnectChatPaneContinueChatButtonStyles, props.styleProps?.continueChatButtonStyleProps),
        rootHovered: Object.assign({}, defaultReconnectChatPaneContinueChatButtonHoveredStyles, props.styleProps?.continueChatButtonHoveredStyleProps),
        rootPressed: Object.assign({}, defaultReconnectChatPaneContinueChatButtonHoveredStyles, props.styleProps?.continueChatButtonHoveredStyleProps), 
        rootFocused: Object.assign({}, defaultReconnectChatPaneContinueChatFocusedStyles, props.styleProps?.continueChatButtonFocusedStyleProps), 
    };

    const startNewChatButtonStyles: IButtonStyles = {
        root: Object.assign({}, defaultReconnectChatPaneStartNewChatButtonStyles, props.styleProps?.startNewChatButtonStyleProps),
        rootHovered: Object.assign({}, defaultReconnectChatPaneStartNewChatButtonHoveredStyles, props.styleProps?.startNewChatButtonHoveredStyleProps),
        rootPressed: Object.assign({}, defaultReconnectChatPaneStartNewChatButtonHoveredStyles, props.styleProps?.startNewChatButtonHoveredStyleProps),
        rootFocused: Object.assign({}, defaultReconnectChatPaneStartChatFocusedStyles, props.styleProps?.startNewChatButtonFocusedStyleProps), 
    };

    return (
        <>
            {!props.controlProps?.hideReconnectChatPane && 
                <Stack 
                    className={props.styleProps?.classNames?.containerClassName}
                    id={elementId}
                    tabIndex={-1}
                    onKeyDown={handleEscKeyDown}
                    dir={props.controlProps?.dir || defaultReconnectChatPaneControlProps.dir}
                    aria-label={props.controlProps?.reconnectChatPaneAriaLabel || defaultReconnectChatPaneControlProps.reconnectChatPaneAriaLabel}
                    styles={containerStyles}>

                    <Stack
                        className={props.styleProps?.classNames?.wrapperClassName}
                        styles={wrapperStyles}
                        tabIndex={-1}
                        id={elementId + "-wrapper"}>

                        {!props.controlProps?.hideTitle && (decodeComponentString(props.componentOverrides?.title) ||
                        <Label
                            className={props.styleProps?.classNames?.titleClassName}
                            styles={titleStyles}
                            tabIndex={-1}
                            id={elementId + "-title"}>
                            {props.controlProps?.titleText || defaultReconnectChatPaneControlProps.titleText}
                        </Label>) }

                        {!props.controlProps?.hideSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) ||
                        <Label
                            className={props.styleProps?.classNames?.subtitleClassName}
                            styles={subtitleStyles}
                            tabIndex={-1}
                            id={elementId + "-subtitle"}>
                            {props.controlProps?.subtitleText || defaultReconnectChatPaneControlProps.subtitleText}
                        </Label>) }
                        
                        {!props.controlProps?.hideIcon && (decodeComponentString(props.componentOverrides?.icon) ||
                        <Icon
                            className={props.styleProps?.classNames?.iconClassName}
                            styles={iconStyles}
                            tabIndex={-1}
                            role={"img"}
                            id={elementId + "-icon"}
                            aria-label={props.controlProps?.iconAriaLabel || defaultReconnectChatPaneControlProps.iconAriaLabel}
                        />) }

                        <Stack horizontal={props.controlProps?.isButtonGroupHorizontal || defaultReconnectChatPaneControlProps.isButtonGroupHorizontal}
                            className={props.styleProps?.classNames?.buttonGroupClassName}
                            styles={buttonGroupStyles}
                            tabIndex={-1}
                            id={elementId + "-buttongroup"}>
                            {!props.controlProps?.hideContinueChatButton && (decodeComponentString(props.componentOverrides?.continueChatButton) ||
                            <DefaultButton
                                className={props.styleProps?.classNames?.continueChatButtonClassName}
                                styles={continueChatButtonStyles}
                                tabIndex={0}
                                text={props.controlProps?.continueChatButtonText || defaultReconnectChatPaneControlProps.continueChatButtonText}
                                onClick={handleContinueChatClick}
                                id={elementId + "-continueconversationbutton"}
                                aria-label={props.controlProps?.continueChatButtonAriaLabel || defaultReconnectChatPaneControlProps.continueChatButtonAriaLabel}
                            >
                            </DefaultButton>)}

                            {!props.controlProps?.hideStartNewChatButton && (decodeComponentString(props.componentOverrides?.startNewChatButton) || 
                            <DefaultButton
                                className={props.styleProps?.classNames?.startNewChatButtonClassName}
                                styles={startNewChatButtonStyles}
                                tabIndex={0}
                                text={props.controlProps?.startNewChatButtonText || defaultReconnectChatPaneControlProps.startNewChatButtonText}
                                onClick={handleStartNewChatClick}
                                id={elementId + "-startnewconversationbutton"}
                                aria-label={props.controlProps?.startNewChatButtonAriaLabel || defaultReconnectChatPaneControlProps.startNewChatButtonAriaLabel}
                            />)}
                        </Stack>
                    </Stack>
                </Stack>
            }
        </>
    );
}

export default ReconnectChatPane;