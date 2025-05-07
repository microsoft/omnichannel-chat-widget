import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { PostChatSurveyPane } from "@microsoft/omnichannel-chat-components";
import { IPostChatSurveyPaneProps } from "@microsoft/omnichannel-chat-components/lib/types/components/postchatsurveypane/interfaces/IPostChatSurveyPaneProps";

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
    controlProps: {
        id: "oc-lcw-postchatsurvey-pane",
        title: "Post chat survey pane",
        surveyURL: "https://tip.customervoice.microsoft.com/Pages/ResponsePage.aspx?id=YkJf70oOwkiRb-bmaZvb3VBXiZokKptMk8ceKB79-oxUQ0lCU0VMQ0IxWUE3WFgzVTJBMjNRNlVISSQlQCNjPTEu&vt=ef5f4262-0e4a-48c2-916f-e6e6699bdbdd_38720c9e-b284-47d0-aea0-f55e9699ee00_637783044550000000_TIP_Hash_07NiQh1yjku%2f4%2fB0UqFs5GZEwGEKXBNwhSuJJERkz3c%3d"
    },
    styleProps: {
        generalStyleProps: {
            width: "360px",
            height: "560px",
            borderStyle: "solid",
            borderRadius: 0,
            borderWidth: "3px",
            backgroundColor: "#FFFFFF",
            borderColor: "#F1F1F1"
        }
    }    
};

/*
    Sample 1 PostChatSurvey Pane
*/
export const PostChatSurveyPaneSample1 = PostChatSurveyPaneTemplate.bind({});
PostChatSurveyPaneSample1.args = {
    controlProps: {
        id: "oc-lcw-postchatsurvey-pane-sample1",
        title: "Post chat survey pane",
        surveyURL: "https://tip.customervoice.microsoft.com/Pages/ResponsePage.aspx?id=YkJf70oOwkiRb-bmaZvb3VBXiZokKptMk8ceKB79-oxUQ0lCU0VMQ0IxWUE3WFgzVTJBMjNRNlVISSQlQCNjPTEu&vt=ef5f4262-0e4a-48c2-916f-e6e6699bdbdd_38720c9e-b284-47d0-aea0-f55e9699ee00_637783044550000000_TIP_Hash_07NiQh1yjku%2f4%2fB0UqFs5GZEwGEKXBNwhSuJJERkz3c%3d"
    },
    styleProps: {
        generalStyleProps: {
            borderStyle: "solid",
            borderRadius: "4px",
            borderWidth: "3px",
            maxWidth: "390px",
            maxHeight: "450px",
            position: "absolute",
            left: "15%",
            top: "20%",
            backgroundColor: "#FFFFFF",
            borderColor: "#FFFFFF"
        }
    }
};