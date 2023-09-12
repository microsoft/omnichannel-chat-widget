import { IStyle } from "@fluentui/react";
import { ICommandButtonControlProps } from "../../../common/interfaces/ICommandButtonControlProps";
import { IImageControlProps } from "../../../common/interfaces/IImageControlProps";
import { INotificationPaneComponentOverrides } from "./INotificationPaneComponentOverrides";

/**
 * This interface will act as a generic object that will have the common properties and also the properties for each scenario.
 * Stateful will populate this interface based on the scenario type and send it to NotificationPane component view.
 */
export interface INotificationPaneInternal {
    /**
     * Common notification properties
     */ 
    // general
    id?: string;
    dir?: "ltr" | "rtl" | "auto";
    generalStyleProps?: IStyle;
    containerClassName?: string;
    componentOverrides?: INotificationPaneComponentOverrides;
    infoGroupStyleProps?: IStyle;

    // title
    hideTitle?: boolean;
    titleText?: string;
    titleStyleProps?: IStyle;
    titleClassName?: string;

    // subtitle
    hideSubtitle?: boolean;
    subtitleText?: string;
    subtitleStyleProps?: IStyle;
    subtitleClassName?: string;

    // hyperlink
    hideHyperlink?: boolean;
    hyperlinkText?: string;
    hyperlinkAriaLabel?: string;
    hyperlinkHref?: string;
    hyperlinkStyleProps?: IStyle;
    hyperlinkHoverStyleProps?: IStyle;
    hyperlinkClassName?: string;

    // notification icon
    hideNotificationIcon?: boolean;
    notificationIconProps?: IImageControlProps;
    notificationIconStyleProps?: IStyle;
    notificationIconClassName?: string;
    notificationIconContainerStyleProps?: IStyle;

    // dismiss button "X"
    hideDismissButton?: boolean;
    dismissButtonProps?: ICommandButtonControlProps;
    dismissButtonStyleProps?: IStyle;
    dismissButtonHoverStyleProps?: IStyle;
    dismissButtonClassName?: string;

    /**
     * Chat disconnect scenario specific properties
     */ 
    // close chat button
    hideCloseChatButton?: boolean;
    closeChatButtonProps?: ICommandButtonControlProps;
    closeChatButtonStyleProps?: IStyle;
    closeChatButtonHoverStyleProps?: IStyle;
    closeChatButtonClassName?: string;

    // button group styles
    buttonGroupStyleProps?: IStyle;

    // ...other notification scenarios to be added
}