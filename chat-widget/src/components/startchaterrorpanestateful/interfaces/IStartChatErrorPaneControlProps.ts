export interface IStartChatErrorPaneControlProps {
    id?: string;
    role?: string;
    dir?: "rtl" | "ltr" | "auto";
    hideIcon?: boolean;
    hideTitle?: boolean;
    hideSubtitle?: boolean;
    titleText?: string;
    subtitleText?: string;
    unauthorizedTitleText?: string;
    unauthorizedSubtitleText?: string;
    authSetupErrorTitleText?: string;
    authSetupErrorSubtitleText?: string;
}