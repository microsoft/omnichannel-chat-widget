import React from "react";
import { ILabelStyles, Image, Label, Stack, Link, IStackStyles, IImageStyles, ILinkStyles } from "@fluentui/react";
import { INotificationPaneInternal } from "./interfaces/common/INotificationPaneInternal";
import DismissButton from "./subcomponents/DismissButton";
import CloseChatButton from "./subcomponents/CloseChatButton";
import { decodeComponentString } from "../../common/decodeComponentString";
import { Ids } from "../../common/Constants";

function NotificationPane(props: INotificationPaneInternal) {
    const elementId = props.id ?? Ids.DefaultNotificationPaneId;

    const containerStyles: IStackStyles = {
        root: Object.assign({}, props.generalStyleProps)
    };

    const titleStyles: ILabelStyles = {
        root: Object.assign({}, props.titleStyleProps)
    };

    const subtitleStyles: ILabelStyles = {
        root: Object.assign({}, props.subtitleStyleProps)
    };

    const hyperlinkStyles: ILinkStyles = {
        root: Object.assign({}, props.hyperlinkStyleProps)
    };
    const hyperlinkHoverStyles: ILinkStyles = {
        root: Object.assign({}, props.hyperlinkHoverStyleProps)
    };

    const notificationIconProps = Object.assign({}, props.notificationIconProps);
    const notificationIconStyles = Object.assign({}, props.notificationIconStyleProps);
    const notificationIconImageStyles: IImageStyles = { root: {}, image: notificationIconStyles };
    const notificationIconContainerStyles: IStackStyles = {
        root: Object.assign({}, props.notificationIconContainerStyleProps)
    };

    const dismissButtonProps = Object.assign({}, props.dismissButtonProps);
    const dismissButtonStyles = Object.assign({}, props.dismissButtonStyleProps);
    const dismissButtonHoverStyles = Object.assign({}, props.dismissButtonHoverStyleProps);

    const closeChatButtonProps = Object.assign({}, props.closeChatButtonProps);
    const closeChatButtonStyles = Object.assign({}, props.closeChatButtonStyleProps);
    const closeChatButtonHoverStyles = Object.assign({}, props.closeChatButtonHoverStyleProps);

    const infoGroupStyles: IStackStyles = {
        root: Object.assign({}, props.infoGroupStyleProps)
    };

    const buttonGroupStyles: IStackStyles = {
        root: Object.assign({}, props.buttonGroupStyleProps)
    };

    return (
        <>
            <Stack className={props.containerClassName}
                styles={containerStyles}
                id={elementId}
                dir={props.dir ?? "ltr"}
                tabIndex={-1}
                role={"presentation"}>

                <Stack horizontal
                    horizontalAlign="space-between"
                    styles={containerStyles}
                    dir={props.dir ?? "ltr"}>
                    <Stack
                        styles={notificationIconContainerStyles}>
                        {!props.hideNotificationIcon && (decodeComponentString(props.componentOverrides?.notificationIcon) || <Image
                            className={notificationIconProps.className}
                            id={notificationIconProps.id}
                            src={notificationIconProps.src}
                            alt={notificationIconProps.alt}
                            tabIndex={-1}
                            styles={notificationIconImageStyles}
                        />)}
                    </Stack>

                    <Stack 
                        styles={infoGroupStyles}
                        dir={props.dir ?? "ltr"}>
                        {!props.hideTitle && (decodeComponentString(props.componentOverrides?.title) || <Label
                            className={props.titleClassName}
                            styles={titleStyles}
                            tabIndex={-1}
                            id={elementId + "-title"}>
                            {props.titleText}
                        </Label>)}
                        {!props.hideSubtitle && (decodeComponentString(props.componentOverrides?.subtitle) || <Label
                            className={props.subtitleClassName}
                            styles={subtitleStyles}
                            tabIndex={-1}
                            id={elementId + "-subtitle"}>
                            {props.subtitleText}
                        </Label>)}
                        {!props.hideHyperlink && (decodeComponentString(props.componentOverrides?.hyperlink) || <Link
                            className={props.hyperlinkClassName}
                            ariaLabel={props.hyperlinkAriaLabel}
                            id={elementId + "-hyperlink"}
                            styles={hyperlinkStyles}
                            hoverStyles={hyperlinkHoverStyles}
                            target={"_blank"}
                            rel={"noopener noreferrer"}
                            href={props.hyperlinkHref}>
                            {props.hyperlinkText}
                        </Link>)}
                    </Stack>

                    {!props.hideDismissButton && (decodeComponentString(props.componentOverrides?.dismissButton) || <DismissButton
                        {...dismissButtonProps}
                        className={props.dismissButtonClassName}
                        onClick={props.dismissButtonProps?.onClick}
                        styles={dismissButtonStyles}
                        hoverStyles={dismissButtonHoverStyles}
                    />)}
                </Stack>

                <Stack horizontal
                    styles={buttonGroupStyles}
                    dir={props.dir ?? "ltr"}>
                    {!props.hideCloseChatButton && <CloseChatButton
                        {...closeChatButtonProps}
                        className={props.closeChatButtonClassName}
                        onClick={props.closeChatButtonProps?.onClick}
                        styles={closeChatButtonStyles}
                        hoverStyles={closeChatButtonHoverStyles}
                    />}
                </Stack>

            </Stack>
        </>
    );
}

export default NotificationPane;