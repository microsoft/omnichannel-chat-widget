import { IAdaptiveCardStyles } from "../../interfaces/IAdaptiveCardStyles";
import { Constants } from "../../../../common/Constants";

export const defaultAdaptiveCardStyles: IAdaptiveCardStyles = {
    background: "white",
    color: "black",
    anchorColor: "blue",
    textWhiteSpace: "normal",
    buttonWhiteSpace: "normal",
    buttonFlexWrap: "nowrap",
    buttonGap: "0px",
    inputFontSize: Constants.minInputFontSize,
};