import { ICommandButtonControlProps } from "../../common/interfaces/ICommandButtonControlProps";
import { IImageControlProps } from "../../common/interfaces/IImageControlProps";
import { ILabelControlProps } from "../../common/interfaces/ILabelControlProps";
import { ReactNode } from "react";

export interface IHeaderControlProps {
    /**
     * header id
     * Mandatory field
     */
    id?: string;
    /**
     * control group appearing at left side of header control
     * appear in order as added into the array
     */
    leftGroup?: {
        children: ReactNode[] | string[] // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    /**
     * control group appearing at middle of header control
     * appear in order as added into the array
     */
    middleGroup?: {
        children: ReactNode[] | string[] // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    /**
     * Control group appearing at right side of header control
     * appear in order as added into the array
     */
    rightGroup?: {
        children: ReactNode[] | string[] // eslint-disable-line @typescript-eslint/no-explicit-any
    };
    /**
     * hide header icon
     */
    hideIcon?: boolean;
    /**
     * hide header title
     */
    hideTitle?: boolean;
    /**
     * hide minimize button
     */
    hideMinimizeButton?: boolean;
    /**
     * hide close button
     */
    hideCloseButton?: boolean;
    /**
     * header minimize button click event
     */
    onMinimizeClick?: () => void;
    /**
     * header close button click event
     */
    onCloseClick?: () => void;
    /**
     * header minimize button props
     */
    minimizeButtonProps?: ICommandButtonControlProps;
    /**
     * header close button props
     */
    closeButtonProps?: ICommandButtonControlProps;
    /**
     * header icon control props
     */
    headerIconProps?: IImageControlProps;
    /**
     * header title control props
     */
    headerTitleProps?: ILabelControlProps;
    /**
     * header component to align right to left.
     */
    dir?: "rtl" | "ltr" | "auto";
}