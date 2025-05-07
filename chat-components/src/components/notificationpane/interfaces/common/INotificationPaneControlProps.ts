import { ICommandButtonControlProps } from "../../../common/interfaces/ICommandButtonControlProps";
import { IImageControlProps } from "../../../common/interfaces/IImageControlProps";

/**
 * This interface will have the common control properties and is inherited by each scenarios.
 */
export interface INotificationPaneControlProps {
    id?: string;
    dir?: "ltr" | "rtl" | "auto";

    hideNotificationPane?: boolean;

    hideTitle?: boolean;
    titleText?: string;

    hideSubtitle?: boolean;
    subtitleText?: string;

    hideDismissButton?: boolean;
    dismissButtonProps?: ICommandButtonControlProps;

    hideHyperlink?: boolean;
    hyperlinkText?: string;
    hyperlinkAriaLabel?: string;
    hyperlinkHref?: string;

    hideIcon?: boolean;
    notificationIconProps?: IImageControlProps;
}