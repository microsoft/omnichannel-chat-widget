import { IPreChatSurveyPaneButtonStyles } from "./IPreChatSurveyPaneButtonStyles";
import { IStyle } from "@fluentui/react";
import { IPreChatSurveyPaneElementStyles } from "./IPreChatSurveyPaneElementStyles";

export interface IPreChatSurveyPaneStyleProps {
    generalStyleProps?: IStyle;
    adaptiveCardContainerStyleProps?: IStyle;
    customButtonStyleProps?: IPreChatSurveyPaneButtonStyles;
    customTextStyleProps?: IPreChatSurveyPaneElementStyles;
    customTextInputStyleProps?: IPreChatSurveyPaneElementStyles;
    customMultilineTextInputStyleProps?: IPreChatSurveyPaneElementStyles;
    customMultichoiceInputStyleProps?: IPreChatSurveyPaneElementStyles;
}