import { ReactNode } from "react";

export interface ICitationPaneComponentOverrides {
    title?: ReactNode | string;
    closeButton?: ReactNode | string;
    topCloseButton?: ReactNode | string;
}