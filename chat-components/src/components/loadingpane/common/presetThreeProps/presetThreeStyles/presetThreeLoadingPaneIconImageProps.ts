import { IImageProps, ImageFit } from "@fluentui/react";

import { LegacyChatIconBase64 } from "../../../../../assets/Icons";

export const presetThreeLoadingPaneIconImageProps: IImageProps = {
    src: LegacyChatIconBase64,
    imageFit: ImageFit.center,
    width: "57px",
    height: "57px",
    shouldFadeIn: false,
    shouldStartVisible: true
};