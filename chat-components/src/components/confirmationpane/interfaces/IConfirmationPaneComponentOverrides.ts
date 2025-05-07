import { ReactNode } from "react";

export interface IConfirmationPaneComponentOverrides {
    title?: ReactNode | string;
    subtitle?: ReactNode | string;
    confirmButton?: ReactNode | string;
    cancelButton?: ReactNode | string;
}
