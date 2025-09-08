// Single suggestion (card action) item definition
export interface ISuggestionItem {
    text: string; // button label
    value?: any; // payload sent on click
    displayText?: string; // optional alternate display
    type?: "imBack" | "postBack" | "messageBack" | "openUrl" | string;
    image?: string;
    imageAlt?: string;
    disabled?: boolean;
    iconName?: string;
}
