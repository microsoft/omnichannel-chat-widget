import { IStyle } from "@fluentui/react";

/**
 * This interface will have the common styles properties and is inherited by each scenarios.
 */
export interface INotificationPaneStyleProps {
    generalStyleProps?: IStyle;
    titleStyleProps?: IStyle;
    subtitleStyleProps?: IStyle;
    dismissButtonStyleProps?: IStyle;
    dismissButtonHoverStyleProps?: IStyle;
    hyperlinkStyleProps?: IStyle;
    hyperlinkHoverStyleProps?: IStyle;
    notificationIconStyleProps?: IStyle;
    notificationIconContainerStyleProps?: IStyle
    infoGroupStyleProps?: IStyle;
}