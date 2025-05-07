import PostChatSurveyPane from "./PostChatSurveyPane";
import { IPostChatSurveyPaneProps } from "./interfaces/IPostChatSurveyPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultPostChatSurveyPaneProps } from "./common/defaultProps/defaultPostChatSurveyPaneProps";
import { presetOnePostChatSurveyPaneProps } from "./common/presetOneProps/presetOnePostChatSurveyPaneProps";

export default {
    title: "Stateless Components/PostChatSurvey Pane",
    component: PostChatSurveyPane,
} as Meta;

const PostChatSurveyPaneTemplate: Story<IPostChatSurveyPaneProps> = (args) => <PostChatSurveyPane {...args}></PostChatSurveyPane>;

/*
    Default PostChatSurvey Pane
*/
export const PostChatSurveyPaneDefault = PostChatSurveyPaneTemplate.bind({});
PostChatSurveyPaneDefault.args = {
    ...defaultPostChatSurveyPaneProps,
    controlProps: {
        surveyURL: "https://ncv.microsoft.com/MPLJKJ3AlF"
    }
};

/*
    Preset 1 PostChatSurvey Pane
*/
export const PostChatSurveyPanePresetOne = PostChatSurveyPaneTemplate.bind({});
PostChatSurveyPanePresetOne.args = {
    ...presetOnePostChatSurveyPaneProps,
    controlProps: {
        surveyURL: "https://ncv.microsoft.com/MPLJKJ3AlF"
    }
};