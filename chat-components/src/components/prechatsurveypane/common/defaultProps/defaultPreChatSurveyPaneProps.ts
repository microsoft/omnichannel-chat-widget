import { IPreChatSurveyPaneProps } from "../../interfaces/IPreChatSurveyPaneProps";
import { defaultPreChatSurveyPaneStyles } from "./defaultStyles/defaultPreChatSurveyPaneStyles";
import { defaultPreChatSurveyPaneControlProps } from "./defaultPreChatSurveyPaneControlProps";

export const defaultPreChatSurveyPaneProps: IPreChatSurveyPaneProps = {
    controlProps: defaultPreChatSurveyPaneControlProps,
    styleProps: defaultPreChatSurveyPaneStyles
};