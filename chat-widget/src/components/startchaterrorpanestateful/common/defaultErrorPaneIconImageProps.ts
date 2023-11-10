import { IImageProps } from "@fluentui/react";
import { ImageFit } from "@fluentui/react";
import { AlertIcon } from "../../../assets/Icons";

export const defaultErrorPaneIconImageStyleProps: IImageProps = {
    src: AlertIcon,
    imageFit: ImageFit.centerContain,
    width: "86px",
    height: "86px",
    shouldFadeIn: false,
    shouldStartVisible: true
};