import { ILoadingPaneStyleProps } from "../../../interfaces/ILoadingPaneStyleProps";
import { presetTwoLoadingPaneGeneralStyles } from "./presetTwoLoadingPaneGeneralStyles";
import { presetTwoLoadingPaneSpinnerStyles } from "./presetTwoLoadingPaneSpinnerStyles";
import { defaultLoadingPaneTitleStyles } from "../../defaultProps/defaultStyles/defaultLoadingPaneTitleStyles";
import { defaultLoadingPaneSubtitleStyles } from "../../defaultProps/defaultStyles/defaultLoadingPaneSubtitleStyles";
import { defaultLoadingPaneIconStyles } from "../../defaultProps/defaultStyles/defaultLoadingPaneIconStyles";
import { defaultLoadingPaneIconImageProps } from "../../defaultProps/defaultStyles/defaultLoadingPaneIconImageProps";
import { defaultLoadingPaneSpinnerTextStyles } from "../../defaultProps/defaultStyles/defaultLoadingPaneSpinnerTextStyles";

export const presetTwoLoadingPaneStyles: ILoadingPaneStyleProps = {
    generalStyleProps: presetTwoLoadingPaneGeneralStyles,
    titleStyleProps: defaultLoadingPaneTitleStyles,
    subtitleStyleProps: defaultLoadingPaneSubtitleStyles,
    iconStyleProps: defaultLoadingPaneIconStyles,
    iconImageProps: defaultLoadingPaneIconImageProps,
    spinnerStyleProps: presetTwoLoadingPaneSpinnerStyles,
    spinnerTextStyleProps: defaultLoadingPaneSpinnerTextStyles
};
