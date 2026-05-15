import { IIconStyles, ILabelStyles, IStackStyles, Icon, Label, Stack } from "@fluentui/react";
import React, { useCallback } from "react";

import { BroadcastService } from "../../services/BroadcastService";
import { ElementType, EventNames, HiddenTextStyles, Ids, KeyCodes } from "../../common/Constants";
import type { IChatButtonProps } from "./interfaces/IChatButtonProps";
import { ICustomEvent } from "../../interfaces/ICustomEvent";
import { decodeComponentString } from "../../common/decodeComponentString";
import { defaultChatButtonControlProps } from "./common/defaultProps/defaultChatButtonControlProps";
import { defaultChatButtonGeneralStyles } from "./common/defaultStyles/defaultChatButtonGeneralStyles";
import { defaultChatButtonIconContainerStyles } from "./common/defaultStyles/defaultChatButtonIconContainerStyles";
import { defaultChatButtonNotificationBubbleStyles } from "./common/defaultStyles/defaultChatButtonNotificationBubbleStyles";
import { defaultChatButtonSubTitleStyles } from "./common/defaultStyles/defaultChatButtonSubTitleStyles";
import { defaultChatButtonTextContainerStyles } from "./common/defaultStyles/defaultChatButtonTextContainerStyles";
import { defaultChatButtonTitleStyles } from "./common/defaultStyles/defaultChatButtonTitleStyles";

function NotificationBubble(props: IChatButtonProps, parentId: string) {
    const notificationBubbleStyles: ILabelStyles = {
        root: Object.assign({}, defaultChatButtonNotificationBubbleStyles, props.styleProps?.notificationBubbleStyleProps)
    };

    const unreadMessageCount = props.controlProps?.unreadMessageCount ?? defaultChatButtonControlProps?.unreadMessageCount  ;
    if (unreadMessageCount !== "0") {
        return (decodeComponentString(props.componentOverrides?.notificationBubble) || 
            <Stack
                aria-live="polite" 
                styles={notificationBubbleStyles}
                aria-label={props.controlProps?.ariaLabelUnreadMessageString ? props.controlProps?.ariaLabelUnreadMessageString : defaultChatButtonControlProps.ariaLabelUnreadMessageString}
                className={props.styleProps?.classNames?.notificationBubbleClassName}
                id={parentId + "-notification-bubble"}>
                {unreadMessageCount}
                <span style={HiddenTextStyles}>{props.controlProps?.unreadMessageString ? props.controlProps?.unreadMessageString : defaultChatButtonControlProps.unreadMessageString}</span>
            </Stack>
        );
    }
    return null;
}

function IconContainer(props: IChatButtonProps, parentId: string) {
    const iconContainerStyles: IIconStyles = {
        root: Object.assign({}, defaultChatButtonIconContainerStyles, props.styleProps?.iconStyleProps)
    };

    return (decodeComponentString(props.componentOverrides?.iconContainer) || 
        <Icon
            className={props.styleProps?.classNames?.iconContainerClassName}
            styles={iconContainerStyles}
            id={parentId + "-icon-container"} >
        </Icon>
    );
}

function TextContainer(props: IChatButtonProps, parentId: string) {
    const textContainerStyles: ILabelStyles = {
        root: Object.assign({}, defaultChatButtonTextContainerStyles, props.styleProps?.textContainerStyleProps)
    };

    const titleStyles: ILabelStyles = {
        root: Object.assign({}, defaultChatButtonTitleStyles, props.styleProps?.titleStyleProps)
    };

    const subtitleStyles: ILabelStyles = {
        root: Object.assign({}, defaultChatButtonSubTitleStyles, props.styleProps?.subtitleStyleProps)
    };

    const hideChatTitle = props.controlProps?.hideChatTitle ?? defaultChatButtonControlProps?.hideChatTitle;
    const hideChatSubtitle = props.controlProps?.hideChatSubtitle ?? defaultChatButtonControlProps?.hideChatSubtitle;
    const titleDir = props.controlProps?.dir ?? defaultChatButtonControlProps?.dir;
    const titleText = props.controlProps?.titleText ?? defaultChatButtonControlProps?.titleText;
    const subtitleDir = props.controlProps?.dir ?? defaultChatButtonControlProps?.dir;
    const subtitleText = props.controlProps?.subtitleText ?? defaultChatButtonControlProps?.subtitleText;

    // internal tracking: when the default title / subtitle Labels are used, hide the
    // text container subtree from the accessibility tree. The button container
    // owns a consolidated aria-label that already announces the same text, so
    // exposing the inner Labels causes NVDA / JAWS browse-mode to land on the
    // same announcement multiple times. Customer overrides for title /
    // subtitle keep their default a11y behavior so they can manage their own
    // accessible names.
    const hideTextFromA11yTree = !props.componentOverrides?.title && !props.componentOverrides?.subtitle;

    return (decodeComponentString(props.componentOverrides?.textContainer) ||
        <Stack
            styles={textContainerStyles}
            className={props.styleProps?.classNames?.textContainerClassName}
            id={parentId + "-text-container"}
            aria-hidden={hideTextFromA11yTree || undefined}
        >
                
            {!hideChatTitle && (decodeComponentString(props.componentOverrides?.title) || 
                <Label
                    styles={titleStyles}
                    dir={titleDir}
                    className={props.styleProps?.classNames?.titleClassName}
                    id={parentId + "-title"}>
                    {titleText}
                </Label> ) }

            {!hideChatSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) || 
                <Label 
                    styles={subtitleStyles}
                    dir={subtitleDir}
                    className={props.styleProps?.classNames?.subtitleClassName}
                    id={parentId + "-subtitle"}>
                    {subtitleText}
                </Label> )}
        </Stack>
    );
}

function ChatButton(props: IChatButtonProps) {
    const elementId = props.controlProps?.id ?? Ids.DefaultChatButtonId;
    const defaultRole = props.controlProps?.role ?? defaultChatButtonControlProps?.role;
    const containersDir = props.controlProps?.dir ?? defaultChatButtonControlProps?.dir;
    const hideChatButton = props.controlProps?.hideChatButton ?? defaultChatButtonControlProps?.hideChatButton;
    const hideChatIcon = props.controlProps?.hideChatIcon ?? defaultChatButtonControlProps?.hideChatIcon;
    const hideChatTextContainer = props.controlProps?.hideChatTextContainer ?? defaultChatButtonControlProps?.hideChatTextContainer;
    const hideNotificationBubble = props.controlProps?.hideNotificationBubble ?? defaultChatButtonControlProps?.hideNotificationBubble;

    // internal tracking: when the consumer has not supplied a custom aria-label and
    // the default title / subtitle Labels are in play, synthesize a single
    // consolidated aria-label from the visible text so NVDA / JAWS browse
    // mode lands on the role=button container exactly once. The text
    // container is also marked aria-hidden in TextContainer so the inner
    // labels do not produce additional virtual-cursor stops.
    const titleText = props.controlProps?.titleText ?? defaultChatButtonControlProps?.titleText;
    const subtitleText = props.controlProps?.subtitleText ?? defaultChatButtonControlProps?.subtitleText;
    const hideChatTitle = props.controlProps?.hideChatTitle ?? defaultChatButtonControlProps?.hideChatTitle;
    const hideChatSubtitle = props.controlProps?.hideChatSubtitle ?? defaultChatButtonControlProps?.hideChatSubtitle;
    const unreadMessageCount = props.controlProps?.unreadMessageCount ?? defaultChatButtonControlProps?.unreadMessageCount;
    const ariaLabelUnreadMessageString = props.controlProps?.ariaLabelUnreadMessageString ?? defaultChatButtonControlProps?.ariaLabelUnreadMessageString;
    const canSynthesizeAriaLabel = !hideChatTextContainer
        && !props.componentOverrides?.textContainer
        && !props.componentOverrides?.title
        && !props.componentOverrides?.subtitle;
    const synthesizedAriaLabel = canSynthesizeAriaLabel
        ? [
            !hideNotificationBubble && unreadMessageCount && unreadMessageCount !== "0"
                ? `${unreadMessageCount} ${ariaLabelUnreadMessageString ?? ""}`.trim()
                : "",
            !hideChatTitle ? titleText : "",
            !hideChatSubtitle ? subtitleText : ""
        ].filter(Boolean).join(" ").trim()
        : "";
    const defaultAriaLabel = props.controlProps?.ariaLabel
        ?? defaultChatButtonControlProps.ariaLabel
        ?? (synthesizedAriaLabel || undefined);

    const chatButtonGroupStyles: IStackStyles = {
        root: Object.assign({}, defaultChatButtonGeneralStyles, props.styleProps?.generalStyleProps)
    };

    const handleInitiateChatClick = useCallback(() => {
        if(props.controlProps?.onClick){
            const customEvent: ICustomEvent = {
                elementType: ElementType.ChatButton,
                elementId: elementId,
                eventName: EventNames.OnClick
            };
            BroadcastService.postMessage(customEvent);
            props.controlProps.onClick();
        }        
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleInputKeyDown = (e: any) => {
        if (e.code === KeyCodes.ENTER || e.code === KeyCodes.SPACE) {
            handleInitiateChatClick();
        }
    };

    return (
        <>
            {!hideChatButton && 
            <Stack horizontal
                id={elementId}
                dir={containersDir}
                styles={chatButtonGroupStyles}
                tabIndex={0}
                role={defaultRole}
                onClick={handleInitiateChatClick}
                onKeyDown={handleInputKeyDown}
                aria-label={defaultAriaLabel}>
                {!hideChatIcon && IconContainer(props, elementId)}
                {!hideNotificationBubble && NotificationBubble(props, elementId)}
                {!hideChatTextContainer && TextContainer(props, elementId)}
            </Stack>}
        </>
    );
}

export default ChatButton;