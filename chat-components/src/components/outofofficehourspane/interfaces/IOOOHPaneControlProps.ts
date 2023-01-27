export interface IOOOHPaneControlProps {
    id?: string;
    role?: string;
    dir?: "rtl" | "ltr" | "auto";
    hideOOOHPane?: boolean;
    hideTitle?: boolean;
    titleText?: string;
    openLinkInNewTab?: boolean;
}