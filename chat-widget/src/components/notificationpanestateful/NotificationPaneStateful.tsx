import React, { Dispatch, useEffect, useRef } from "react";
import { NotificationPane } from "@microsoft/omnichannel-chat-components";
import { hooks } from "botframework-webchat";
import { useCallback } from "react";
import { INotificationPaneStatefulProps } from "./interfaces/INotificationPaneStatefulProps";
import { INotificationPaneInternal } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/interfaces/common/INotificationPaneInternal";
import { NotificationScenarios } from "../webchatcontainerstateful/webchatcontroller/enums/NotificationScenarios";
import useChatAdapterStore from "../../hooks/useChatAdapterStore";
import { ILiveChatWidgetContext } from "../../contexts/common/ILiveChatWidgetContext";
import { ILiveChatWidgetAction } from "../../contexts/common/ILiveChatWidgetAction";
import useChatContextStore from "../../hooks/useChatContextStore";
import { TelemetryHelper } from "../../common/telemetry/TelemetryHelper";
import { LogLevel, TelemetryEvent } from "../../common/telemetry/TelemetryConstants";
import { LiveChatWidgetActionType } from "../../contexts/common/LiveChatWidgetActionType";
import { ConfirmationState, NotificationPaneConstants } from "../../common/Constants";
import { defaultChatDisconnectStyleProps } from "./defaultProps/defaultChatDisconnectStyleProps";
import { defaultChatDisconnectControlProps } from "./defaultProps/defaultChatDisconnectControlProps";

export const NotificationPaneStateful = (props: INotificationPaneStatefulProps) => {
    const { notificationPaneProps, notificationScenarioType, endChat } = props;

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter,]: [any, (adapter: any) => void] = useChatAdapterStore();
    const localConfirmationPaneState = useRef(state?.domainStates?.confirmationState);

    const onCloseChatClick = async () => {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.NotificationCloseChatButtonClicked, Description: "Notification Close Chat button clicked." });

        if (localConfirmationPaneState.current !== ConfirmationState.Ok) {
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: true });
        } else {
            const skipEndChatSDK = true;
            const skipCloseChat = false;
            const postMessageToOtherTabs = true;
            await endChat(adapter, skipEndChatSDK, skipCloseChat, postMessageToOtherTabs);
        }
    };

    useEffect(() => {
        localConfirmationPaneState.current = state?.domainStates?.confirmationState;
    }, [state?.domainStates?.confirmationState]);

    const {useDismissNotification} = hooks;
    const dismissNotification = useDismissNotification();
    const handleDismissNotification = useCallback(() => {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.NotificationDismissButtonClicked, Description: `${notificationScenarioType} Notification Dismiss button clicked.` });
        dismissNotification(notificationScenarioType ?? "");
    }, [notificationScenarioType]); 

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateTitleInternalProps = (notificationProps: any) => {
        return {
            hideTitle: notificationProps.controlProps?.hideTitle ?? defaultChatDisconnectControlProps.hideTitle,
            titleText: notificationProps.controlProps?.titleText ?? defaultChatDisconnectControlProps.titleText,
            titleStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.titleStyleProps, notificationProps.styleProps?.titleStyleProps),
            titleClassName: notificationProps.styleProps?.classNames?.titleClassName ?? defaultChatDisconnectStyleProps.classNames?.titleClassName,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateSubtitleInternalProps = (notificationProps: any) => {
        return {
            hideSubtitle: notificationProps.controlProps?.hideSubtitle ?? defaultChatDisconnectControlProps.hideSubtitle,
            subtitleText: notificationProps.controlProps?.subtitleText ?? defaultChatDisconnectControlProps.subtitleText,
            subtitleStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.subtitleStyleProps, notificationProps.styleProps?.subtitleStyleProps),
            subtitleClassName: notificationProps.styleProps?.classNames?.subtitleClassName ?? defaultChatDisconnectStyleProps.classNames?.subtitleClassName,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateHyperlinkInternalProps = (notificationProps: any) => {
        return {
            hideHyperlink: notificationProps.controlProps?.hideHyperlink ?? defaultChatDisconnectControlProps.hideHyperlink,
            hyperlinkText: notificationProps.controlProps?.hyperlinkText ?? defaultChatDisconnectControlProps.hyperlinkText,
            hyperlinkAriaLabel: notificationProps.controlProps?.hyperlinkAriaLabel ?? defaultChatDisconnectControlProps.hyperlinkAriaLabel,
            hyperlinkHref: notificationProps.controlProps?.hyperlinkHref ?? defaultChatDisconnectControlProps.hyperlinkHref,
            hyperlinkStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.hyperlinkStyleProps, notificationProps.styleProps?.hyperlinkStyleProps),
            hyperlinkHoverStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.hyperlinkHoverStyleProps, notificationProps.styleProps?.hyperlinkHoverStyleProps),
            hyperlinkClassName: notificationProps.styleProps?.classNames?.hyperlinkClassName ?? defaultChatDisconnectStyleProps.classNames?.hyperlinkClassName,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateNotificationIconInternalProps = (notificationProps: any) => {
        return {
            hideNotificationIcon: notificationProps.controlProps?.hideIcon ?? defaultChatDisconnectControlProps.hideIcon,
            notificationIconProps: Object.assign({}, defaultChatDisconnectControlProps.notificationIconProps, notificationProps.controlProps?.notificationIconProps),
            notificationIconStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.notificationIconStyleProps, notificationProps.styleProps?.notificationIconStyleProps),
            notificationIconClassName: notificationProps.styleProps?.classNames?.notificationIconClassName ?? defaultChatDisconnectStyleProps.classNames?.notificationIconClassName,
            notificationIconContainerStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.notificationIconContainerStyleProps, notificationProps.styleProps?.notificationIconContainerStyleProps),
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateDismissButtonInternalProps = (notificationProps: any) => {
        return {
            hideDismissButton: notificationProps.controlProps?.hideDismissButton ?? defaultChatDisconnectControlProps.hideDismissButton,
            dismissButtonProps: Object.assign({ onClick: handleDismissNotification }, defaultChatDisconnectControlProps.dismissButtonProps, notificationProps.controlProps?.dismissButtonProps),
            dismissButtonStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.dismissButtonStyleProps, notificationProps.styleProps?.dismissButtonStyleProps),
            dismissButtonHoverStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.dismissButtonHoverStyleProps, notificationProps.styleProps?.dismissButtonHoverStyleProps),
            dismissButtonClassName: notificationProps.styleProps?.classNames?.dismissButtonClassName ?? defaultChatDisconnectStyleProps.classNames?.dismissButtonClassName,
        };
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateCloseChatButtonInternalProps = (notificationProps: any) => {
        return {
            hideCloseChatButton: notificationProps.controlProps?.hideCloseChatButton ?? defaultChatDisconnectControlProps.hideCloseChatButton,
            closeChatButtonProps: Object.assign({ onClick: onCloseChatClick }, defaultChatDisconnectControlProps.closeChatButtonProps, notificationProps.controlProps?.closeChatButtonProps),
            closeChatButtonStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.closeChatButtonStyleProps, notificationProps.styleProps?.closeChatButtonStyleProps),
            closeChatButtonHoverStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.closeChatButtonHoverStyleProps, notificationProps.styleProps?.closeChatButtonHoverStyleProps),
            closeChatButtonClassName: notificationProps.styleProps?.classNames?.closeChatButtonClassName ?? defaultChatDisconnectStyleProps.classNames?.closeChatButtonClassName,
        };
    };

    let genericPropsObj: INotificationPaneInternal = {};

    // Populate INotificationPaneInternal after merging customized props with default props
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateInternalProps = (notificationProps: any) => {
        if (!notificationProps) {
            notificationProps = {};
        }
        
        genericPropsObj = {
            id: notificationProps.id ?? NotificationPaneConstants.DefaultNotificationPaneId,
            dir: notificationProps.dir,
            generalStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.generalStyleProps, notificationProps.styleProps?.generalStyleProps),
            containerClassName: notificationProps.styleProps?.classNames?.containerClassName ?? defaultChatDisconnectStyleProps.classNames?.containerClassName,
            componentOverrides: notificationProps.componentOverrides,
            infoGroupStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.infoGroupStyleProps, notificationProps.styleProps?.infoGroupStyleProps),
            buttonGroupStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.buttonGroupStyleProps, notificationProps.styleProps?.buttonGroupStyleProps),
            ...populateTitleInternalProps(notificationProps),
            ...populateSubtitleInternalProps(notificationProps),
            ...populateHyperlinkInternalProps(notificationProps),
            ...populateNotificationIconInternalProps(notificationProps),
            ...populateDismissButtonInternalProps(notificationProps),
            ...populateCloseChatButtonInternalProps(notificationProps),
        };
    };
    
    switch (notificationScenarioType) {
        case NotificationScenarios.ChatDisconnect:
            populateInternalProps(notificationPaneProps?.chatDisconnectNotificationProps);
            break;
        // TODO additional scenarios to be added...
    }

    return (
        <NotificationPane
            {...genericPropsObj}
        />
    );
};

export default NotificationPaneStateful;