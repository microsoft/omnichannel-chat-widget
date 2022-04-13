import { ReactNode } from "react";

export interface IHeaderComponentOverrides {
    /**
     * custom header icon control
     */
    headerIcon?: ReactNode | string;
    /**
     * custom header title icon control
     */
    headerTitle?: ReactNode | string;
    /**
     * custom header minimize button
     */
    headerMinimizeButton?: ReactNode | string;
    /**
     * custom header close button
     */
    headerCloseButton?: ReactNode | string;
}