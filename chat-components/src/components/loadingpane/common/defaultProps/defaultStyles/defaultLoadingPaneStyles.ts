import { ILoadingPaneStyleProps } from "../../../interfaces/ILoadingPaneStyleProps";
import { defaultLoadingPaneGeneralStyles } from "./defaultLoadingPaneGeneralStyles";
import { defaultLoadingPaneIconStyles } from "./defaultLoadingPaneIconStyles";
import { defaultLoadingPaneIconImageProps } from "./defaultLoadingPaneIconImageProps";
import { defaultLoadingPaneSubtitleStyles } from "./defaultLoadingPaneSubtitleStyles";
import { defaultLoadingPaneTitleStyles } from "./defaultLoadingPaneTitleStyles";
import { defaultLoadingPaneSpinnerStyles } from "./defaultLoadingPaneSpinnerStyles";
import { defaultLoadingPaneSpinnerTextStyles } from "./defaultLoadingPaneSpinnerTextStyles";

export const defaultLoadingPaneStyles: ILoadingPaneStyleProps = {
    generalStyleProps: defaultLoadingPaneGeneralStyles,
    titleStyleProps: defaultLoadingPaneTitleStyles,
    subtitleStyleProps: defaultLoadingPaneSubtitleStyles,
    iconStyleProps: defaultLoadingPaneIconStyles,
    iconImageProps: defaultLoadingPaneIconImageProps,
    spinnerStyleProps: defaultLoadingPaneSpinnerStyles,
    spinnerTextStyleProps: defaultLoadingPaneSpinnerTextStyles
};
