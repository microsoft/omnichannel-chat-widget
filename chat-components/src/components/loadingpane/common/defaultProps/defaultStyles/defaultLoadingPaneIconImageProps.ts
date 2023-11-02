import { IImageProps, ImageFit } from "@fluentui/react";

import { ModernChatIconBase64 } from "../../../../../assets/Icons";

export const defaultLoadingPaneIconImageProps: IImageProps = {
    src: ModernChatIconBase64,
    imageFit: ImageFit.centerContain,
    width: "86px",
    height: "86px",
    shouldFadeIn: false,
    shouldStartVisible: true
};