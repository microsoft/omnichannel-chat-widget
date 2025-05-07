import { ReactNode } from "react";

export interface ILoadingPaneComponentOverrides {
    icon?: ReactNode | string;
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    spinner?: ReactNode | string;
    spinnerText?: ReactNode | string;
}
