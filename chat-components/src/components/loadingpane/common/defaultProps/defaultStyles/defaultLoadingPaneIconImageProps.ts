import { IImageProps, ImageFit } from "@fluentui/react";
import chatImg from "../../../../../assets/imgs/chat.svg";

export const defaultLoadingPaneIconImageProps: IImageProps = {
    src: chatImg,
    imageFit: ImageFit.center,
    width: "86px",
    height: "86px",
    shouldFadeIn: false,
    shouldStartVisible: true
};