import { ICallingContainerProps } from "../../interfaces/ICallingContainerProps";
import { defaultCallingContainerStyles } from "../defaultStyles/defaultCallingContainerStyles";
import { defaultCallingContainerControlProps } from "./defaultCallingContainerControlProps";

export const defaultCallingContainerProps: ICallingContainerProps = {
    controlProps: defaultCallingContainerControlProps,
    styleProps: defaultCallingContainerStyles
};