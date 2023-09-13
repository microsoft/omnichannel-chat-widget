import { ReactNode } from "react";

/**
 * This interface will have the component overrides properties.
 * It acts as common interface for all the scenarios for component overrides.
 */
export interface INotificationPaneComponentOverrides {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    dismissButton?: ReactNode | string;
    hyperlink?: ReactNode | string;
    notificationIcon?: ReactNode | string;
}