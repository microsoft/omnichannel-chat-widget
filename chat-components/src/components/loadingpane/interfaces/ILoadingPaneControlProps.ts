import { SpinnerSize } from "@fluentui/react";

export interface ILoadingPaneControlProps {
    id?: string;
    role?: string;
    dir?: "rtl" | "ltr" | "auto";
    hideLoadingPane?: boolean;
    hideIcon?: boolean;
    hideTitle?: boolean;
    titleText?: string;
    hideSubtitle?: boolean;
    subtitleText?: string;
    hideSpinner?: boolean;
    spinnerSize?: SpinnerSize;
    hideSpinnerText?: boolean;
    spinnerText?: string;
}