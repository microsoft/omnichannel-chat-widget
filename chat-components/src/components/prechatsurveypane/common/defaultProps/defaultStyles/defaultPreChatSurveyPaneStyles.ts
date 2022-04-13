import { IPreChatSurveyPaneStyleProps } from "../../../interfaces/IPreChatSurveyPaneStyleProps";
import { defaultPreChatSurveyPaneACContainerStyles } from "./defaultPreChatSurveyPaneACContainerStyles";
import { defaultPreChatSurveyPaneButtonStyles } from "./defaultPreChatSurveyPaneButtonStyles";
import { defaultPreChatSurveyPaneGeneralStyles } from "./defaultPreChatSurveyPaneGeneralStyles";

export const defaultPreChatSurveyPaneStyles: IPreChatSurveyPaneStyleProps = {
    generalStyleProps: defaultPreChatSurveyPaneGeneralStyles,
    customButtonStyleProps: defaultPreChatSurveyPaneButtonStyles,
    adaptiveCardContainerStyleProps: defaultPreChatSurveyPaneACContainerStyles
};
