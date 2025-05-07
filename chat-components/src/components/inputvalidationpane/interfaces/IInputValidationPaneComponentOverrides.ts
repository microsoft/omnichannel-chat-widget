import { ReactNode } from "react";

export interface IInputValidationPaneComponentOverrides {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    input?: ReactNode | string;
    invalidInputErrorMessage?: ReactNode | string;
    sendButton?: ReactNode | string;
    cancelButton?: ReactNode | string;
}