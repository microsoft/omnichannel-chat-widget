import { IPreChatSurveyPaneStyleProps } from "../../../interfaces/IPreChatSurveyPaneStyleProps";
import { defaultPreChatSurveyPaneACContainerStyles } from "./defaultPreChatSurveyPaneACContainerStyles";
import { defaultPreChatSurveyPaneButtonStyles } from "./defaultPreChatSurveyPaneButtonStyles";
import { defaultPreChatSurveyPaneGeneralStyles } from "./defaultPreChatSurveyPaneGeneralStyles";
import { defaultPreChatSurveyPaneMultilineTextInputStyles } from "./defaultPreChatSurveyPaneMultilineTextInputStyles";
import { defaultPreChatSurveyPaneTextInputStyles } from "./defaultPreChatSurveyPaneTextInputStyles";

export const defaultPreChatSurveyPaneStyles: IPreChatSurveyPaneStyleProps = {
    generalStyleProps: defaultPreChatSurveyPaneGeneralStyles,
    customButtonStyleProps: defaultPreChatSurveyPaneButtonStyles,
    adaptiveCardContainerStyleProps: defaultPreChatSurveyPaneACContainerStyles,
    customTextInputStyleProps: defaultPreChatSurveyPaneTextInputStyles,
    customMultilineTextInputStyleProps: defaultPreChatSurveyPaneMultilineTextInputStyles
};
