export interface IPreChatSurveyPaneControlProps {
    id?: string;
    role?: string;
    dir?: "rtl" | "ltr" | "auto";
    hidePreChatSurveyPane?: boolean;
    payload?: string;
    adaptiveCardHostConfig?: string;
    requiredFieldMissingMessage?: string;
    onSubmit?: (values: { index: number, label: any, id: any, value: string }[]) => void;
}