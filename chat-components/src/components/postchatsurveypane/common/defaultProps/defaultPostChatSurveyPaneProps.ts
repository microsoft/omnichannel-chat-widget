import { IPostChatSurveyPaneProps } from "../../interfaces/IPostChatSurveyPaneProps";
import { defaultPostChatSurveyPaneStyles } from "./defaultStyles/defaultPostChatSurveyPaneStyles";
import { defaultPostChatSurveyPaneControlProps } from "./defaultPostChatSurveyPaneControlProps";

export const defaultPostChatSurveyPaneProps: IPostChatSurveyPaneProps = {
    controlProps: defaultPostChatSurveyPaneControlProps,
    styleProps: defaultPostChatSurveyPaneStyles
};