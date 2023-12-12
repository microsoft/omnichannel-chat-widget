import { IPreChatSurveyPaneStyleProps } from "../../../interfaces/IPreChatSurveyPaneStyleProps";
import { defaultPreChatSurveyPaneACContainerStyles } from "./defaultPreChatSurveyPaneACContainerStyles";
import { defaultPreChatSurveyPaneButtonStyles } from "./defaultPreChatSurveyPaneButtonStyles";
import { defaultPreChatSurveyPaneGeneralStyles } from "./defaultPreChatSurveyPaneGeneralStyles";
import { defaultPreChatSurveyPaneMultilineTextInputStyles } from "./defaultPreChatSurveyPaneMultilineTextInputStyles";
import { defaultPreChatSurveyPaneTextInputStyles } from "./defaultPreChatSurveyPaneTextInputStyles";
import { defaultPreChatSurveyPaneMultichoiceInputStyles } from "./defaultPreChatSurveyPaneMultichoiceInputStyles";
import { defaultPreChatSurveyPaneToggleInputStyles } from "./defaultPreChatSurveyPaneToggleInputStyles";

export const defaultPreChatSurveyPaneStyles: IPreChatSurveyPaneStyleProps = {
    generalStyleProps: defaultPreChatSurveyPaneGeneralStyles,
    customButtonStyleProps: defaultPreChatSurveyPaneButtonStyles,
    adaptiveCardContainerStyleProps: defaultPreChatSurveyPaneACContainerStyles,
    customTextInputStyleProps: defaultPreChatSurveyPaneTextInputStyles,
    customMultilineTextInputStyleProps: defaultPreChatSurveyPaneMultilineTextInputStyles,
    customMultichoiceInputStyleProps: defaultPreChatSurveyPaneMultichoiceInputStyles,
    customToggleInputStyleProps: defaultPreChatSurveyPaneToggleInputStyles
};
