import { ILoadingPaneStyleProps } from "../../../interfaces/ILoadingPaneStyleProps";
import { presetThreeLoadingPaneGeneralStyles } from "./presetThreeLoadingPaneGeneralStyles";
import { presetThreeLoadingPaneIconStyles } from "./presetThreeLoadingPaneIconStyles";
import { presetThreeLoadingPaneIconImageProps } from "./presetThreeLoadingPaneIconImageProps";
import { presetThreeLoadingPaneSubtitleStyles } from "./presetThreeLoadingPaneSubtitleStyles";
import { presetThreeLoadingPaneTitleStyles } from "./presetThreeLoadingPaneTitleStyles";
import { presetThreeLoadingPaneSpinnerStyles } from "./presetThreeLoadingPaneSpinnerStyles";
import { presetThreeLoadingPaneSpinnerTextStyles } from "./presetThreeLoadingPaneSpinnerTextStyles";

export const presetThreeLoadingPaneStyles: ILoadingPaneStyleProps = {
    generalStyleProps: presetThreeLoadingPaneGeneralStyles,
    titleStyleProps: presetThreeLoadingPaneTitleStyles,
    subtitleStyleProps: presetThreeLoadingPaneSubtitleStyles,
    iconStyleProps: presetThreeLoadingPaneIconStyles,
    iconImageProps: presetThreeLoadingPaneIconImageProps,
    spinnerStyleProps: presetThreeLoadingPaneSpinnerStyles,
    spinnerTextStyleProps: presetThreeLoadingPaneSpinnerTextStyles
};
