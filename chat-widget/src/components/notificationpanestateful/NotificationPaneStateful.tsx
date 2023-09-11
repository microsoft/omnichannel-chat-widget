import React, { Dispatch, useRef } from "react";
import { NotificationPane } from "@microsoft/omnichannel-chat-components";
// import { NotificationBanner } from "@microsoft/omnichannel-chat-components";
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
import { ConfirmationState } from "../../common/Constants";
// import { defaultChatDisconnectStyleProps } from "./defaultProps/defaultStyles/defaultChatDisconnectStyleProps";
import { defaultChatDisconnectControlProps } from "./defaultProps/defaultChatDisconnectControlProps";
// import { defaultChatDisconnectControlProps } from "@microsoft/omnichannel-chat-components/lib/types/components/notificationpane/defaultProps/defaultChatDisconnectControlProps";

export const NotificationPaneStateful = (props: INotificationPaneStatefulProps) => {
    const { notificationPaneProps, notificationScenarioType, endChat } = props;

    console.log("ADAD notificationPaneProps", notificationPaneProps);
    console.log("ADAD notificationType", notificationScenarioType);

    const [state, dispatch]: [ILiveChatWidgetContext, Dispatch<ILiveChatWidgetAction>] = useChatContextStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [adapter,]: [any, (adapter: any) => void] = useChatAdapterStore();
    const localConfirmationPaneState = useRef(state?.domainStates?.confirmationState);

    const onCloseChatClick = async () => {
        TelemetryHelper.logActionEvent(LogLevel.INFO, { Event: TelemetryEvent.NotificationCloseChatButtonClicked, Description: "Notification Close Chat button clicked." });

        if (localConfirmationPaneState.current !== ConfirmationState.Ok) {
            console.log("ADAD show confirmation");
            dispatch({ type: LiveChatWidgetActionType.SET_SHOW_CONFIRMATION, payload: true });
        } else {
            const skipEndChatSDK = true;
            const skipCloseChat = false;
            const postMessageToOtherTabs = true;
            console.log("ADAD endChat SDK call");
            await endChat(adapter, skipEndChatSDK, skipCloseChat, postMessageToOtherTabs);
        }
    };

    const {useDismissNotification} = hooks;
    const dismissNotification = useDismissNotification();
    const handleDismissNotification = useCallback(() => dismissNotification(notificationScenarioType ?? ""), []); 

    let genericPropsObj: INotificationPaneInternal = {};

    // const mergedGeneralStyleProps = Object.assign({}, defaultChatDisconnectStyleProps.generalStyleProps, notificationPaneProps.styleProps?.generalStyleProps);

    // const mergedTitleProps = Object.assign({}, defaultChatDisconnectControlProps, notificationProps.styleProps?.generalStyleProps);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const populateInternalProps = (notificationProps: any) => {
        // populate INotificationPaneInternal after merging in customized props with default props (using mergeProps)
        console.log("ADAD populating internal props using: ", notificationProps);
        genericPropsObj = {
            // generalStyleProps: Object.assign({}, defaultChatDisconnectStyleProps.generalStyleProps, notificationProps.styleProps?.generalStyleProps),
            generalStyleProps: notificationProps.styleProps?.generalStyleProps,
            containerClassName: notificationProps.styleProps?.classNames?.containerClassName,
            componentOverrides: notificationProps.componentOverrides,
            hideTitle: notificationProps.controlProps?.hideTitle,
            titleText: notificationProps.controlProps?.titleText ?? defaultChatDisconnectControlProps.titleText,
            titleStyleProps: notificationProps.styleProps?.titleStyleProps,
            titleClassName: notificationProps.styleProps?.classNames?.titleClassName,
            hideSubtitle: notificationProps.controlProps?.hideSubtitle,
            subtitleText: notificationProps.controlProps?.subtitleText ?? defaultChatDisconnectControlProps.subtitleText,
            subtitleStyleProps: notificationProps.styleProps?.subtitleStyleProps,
            subtitleClassName: notificationProps.styleProps?.classNames?.subtitleClassName,
            hideHyperlink: notificationProps.controlProps?.hideHyperlink,
            hyperlinkText: notificationProps.controlProps?.hyperlinkText,
            hyperlinkAriaLabel: notificationProps.controlProps?.hyperlinkAriaLabel,
            hyperlinkHref: notificationProps.controlProps?.hyperlinkHref,
            hyperlinkStyleProps: notificationProps.styleProps?.hyperlinkStyleProps,
            hyperlinkHoverStyleProps: notificationProps.styleProps?.hyperlinkHoverStyleProps,
            hyperlinkClassName: notificationProps.styleProps?.classNames?.hyperlinkClassName,
            hideNotificationIcon: notificationProps.controlProps?.hideNotificationIcon,
            notificationIconProps: Object.assign({}, defaultChatDisconnectControlProps.notificationIconProps, notificationProps.controlProps?.notificationIconProps), // depending on level, return the icon needed
            notificationIconStyleProps: notificationProps.styleProps?.notificationIconStyleProps,
            notificationIconClassName: notificationProps.styleProps?.classNames?.notificationIconClassName,
            hideDismissButton: notificationProps.controlProps?.hideDismissButton,
            dismissButtonProps: {
                onClick: handleDismissNotification,
                ...notificationProps.controlProps?.dismissButtonProps
            },
            dismissButtonStyleProps: notificationProps.styleProps?.dismissButtonStyleProps,
            dismissButtonHoverStyleProps: notificationProps.styleProps?.dismissButtonHoverStyleProps,
            dismissButtonClassName: notificationProps.styleProps?.classNames?.dismissButtonClassName,
            hideCloseChatButton: notificationProps.controlProps?.hideCloseChatButton, // in the case a scenario does not have showCloseChatButton, this value will be undefined and not rendered
            closeChatButtonProps: {
                onClick: onCloseChatClick,
                ...notificationProps.controlProps?.closeChatButtonProps
            },
            closeChatButtonStyleProps: notificationProps.styleProps?.closeChatButtonStyleProps,
            closeChatButtonHoverStyleProps: notificationProps.styleProps?.closeChatButtonHoverStyleProps,
            closeChatButtonClassName: notificationProps.styleProps?.classNames?.closeChatButtonClassName,
            infoGroupStyleProps: notificationProps.styleProps?.infoGroupStyleProps,
            buttonGroupStyleProps: notificationProps.styleProps?.buttonGroupStyleProps,
        };
    };

    // perhaps do an initial merge of general notification pane props first, and then merge the more specfic default cases (ie. chat disconnect)
    switch (notificationScenarioType) {
        case NotificationScenarios.ChatDisconnect:
            populateInternalProps(notificationPaneProps?.chatDisconnectNotificationProps); // merging of default chatDisconnectNotification props to be passed in as a parameter and done within this method
            break;
        // case NotificationScenarios.AttachmentError:
        //     populateInternalProps(props.notificationPaneProps?.attachmentErrorNotificationProps);
        // additional scenario type cases to be added...
        default:
            populateInternalProps(notificationPaneProps?.chatDisconnectNotificationProps);
    }

    console.log("ADAD genericPropsObj", genericPropsObj);

    return (
        <NotificationPane
            {...genericPropsObj}
        />
    );
};

export default NotificationPaneStateful;