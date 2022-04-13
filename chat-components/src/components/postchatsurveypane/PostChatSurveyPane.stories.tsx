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
        surveyURL: "https://tip.customervoice.microsoft.com/Pages/ResponsePage.aspx?id=YkJf70oOwkiRb-bmaZvb3VBXiZokKptMk8ceKB79-oxUQ0lCU0VMQ0IxWUE3WFgzVTJBMjNRNlVISSQlQCNjPTEu&vt=ef5f4262-0e4a-48c2-916f-e6e6699bdbdd_38720c9e-b284-47d0-aea0-f55e9699ee00_637783044550000000_TIP_Hash_07NiQh1yjku%2f4%2fB0UqFs5GZEwGEKXBNwhSuJJERkz3c%3d"
    }
};

/*
    Preset 1 PostChatSurvey Pane
*/
export const PostChatSurveyPanePresetOne = PostChatSurveyPaneTemplate.bind({});
PostChatSurveyPanePresetOne.args = {
    ...presetOnePostChatSurveyPaneProps,
    controlProps: {
        surveyURL: "https://tip.customervoice.microsoft.com/Pages/ResponsePage.aspx?id=YkJf70oOwkiRb-bmaZvb3VBXiZokKptMk8ceKB79-oxUQ0lCU0VMQ0IxWUE3WFgzVTJBMjNRNlVISSQlQCNjPTEu&vt=ef5f4262-0e4a-48c2-916f-e6e6699bdbdd_38720c9e-b284-47d0-aea0-f55e9699ee00_637783044550000000_TIP_Hash_07NiQh1yjku%2f4%2fB0UqFs5GZEwGEKXBNwhSuJJERkz3c%3d"
    }
};