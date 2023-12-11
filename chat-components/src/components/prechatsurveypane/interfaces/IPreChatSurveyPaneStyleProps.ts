import { IPreChatSurveyPaneButtonStyles } from "./IPreChatSurveyPaneButtonStyles";
import { IStyle } from "@fluentui/react";
import { IPreChatSurveyPaneElementStyles } from "./IPreChatSurveyPaneElementStyles";
import { IPreChatSurveyPaneToggleInputStyles } from "./IPreChatSurveyPaneToggleInputStyles";

export interface IPreChatSurveyPaneStyleProps {
    generalStyleProps?: IStyle;
    adaptiveCardContainerStyleProps?: IStyle;
    customButtonStyleProps?: IPreChatSurveyPaneButtonStyles;
    customTextStyleProps?: IPreChatSurveyPaneElementStyles;
    customTextInputStyleProps?: IPreChatSurveyPaneElementStyles;
    customMultilineTextInputStyleProps?: IPreChatSurveyPaneElementStyles;
    customMultichoiceInputStyleProps?: IPreChatSurveyPaneElementStyles;
    customToggleInputStyleProps?: IPreChatSurveyPaneToggleInputStyles;
}