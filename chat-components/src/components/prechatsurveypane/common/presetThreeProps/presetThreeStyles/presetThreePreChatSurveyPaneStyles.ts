import { IPreChatSurveyPaneStyleProps } from "../../../interfaces/IPreChatSurveyPaneStyleProps";
import { presetThreePreChatSurveyPaneACContainerStyles } from "./presetThreePreChatSurveyPaneACContainerStyles";
import { presetThreePreChatSurveyPaneButtonStyles } from "./presetThreePreChatSurveyPaneButtonStyles";
import { presetThreePreChatSurveyPaneGeneralStyles } from "./presetThreePreChatSurveyPaneGeneralStyles";

export const presetThreePreChatSurveyPaneStyles: IPreChatSurveyPaneStyleProps = {
    generalStyleProps: presetThreePreChatSurveyPaneGeneralStyles,
    customButtonStyleProps: presetThreePreChatSurveyPaneButtonStyles,
    adaptiveCardContainerStyleProps: presetThreePreChatSurveyPaneACContainerStyles
};
