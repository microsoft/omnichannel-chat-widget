import { IPreChatSurveyPaneProps } from "../../interfaces/IPreChatSurveyPaneProps";
import { defaultPreChatSurveyPaneStyles } from "../defaultProps/defaultStyles/defaultPreChatSurveyPaneStyles";
import { presetOnePreChatSurveyPaneControlProps } from "./presetOnePreChatSurveyPaneControlProps";

export const presetOnePreChatSurveyPaneProps: IPreChatSurveyPaneProps = {
    controlProps: presetOnePreChatSurveyPaneControlProps,
    styleProps: defaultPreChatSurveyPaneStyles
};