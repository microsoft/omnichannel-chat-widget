import PreChatSurveyPane from "./PreChatSurveyPane";
import { IPreChatSurveyPaneProps } from "./interfaces/IPreChatSurveyPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultPreChatSurveyPaneProps } from "./common/defaultProps/defaultPreChatSurveyPaneProps";
import { presetOnePreChatSurveyPaneProps } from "./common/presetOneProps/presetOnePreChatSurveyPaneProps";
import { presetTwoPreChatSurveyPaneProps } from "./common/presetTwoProps/presetTwoPreChatSurveyPaneProps";
import { presetThreePreChatSurveyPaneProps } from "./common/presetThreeProps/presetThreePreChatSurveyPaneProps";

export default {
    title: "Stateless Components/PreChatSurvey Pane",
    component: PreChatSurveyPane,
} as Meta;

const PreChatSurveyPaneTemplate: Story<IPreChatSurveyPaneProps> = (args) => <PreChatSurveyPane {...args}></PreChatSurveyPane>;

/*
    Default PreChatSurvey Pane
*/
export const PreChatSurveyPaneDefault = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPaneDefault.args = defaultPreChatSurveyPaneProps;

/*
    Preset One PreChatSurvey Pane (RTL)
*/
export const PreChatSurveyPanePreset1 = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPanePreset1.args = presetOnePreChatSurveyPaneProps;

/*
    Preset Two PreChatSurvey Pane (UX Friendly Adaptive Card)
*/
export const PreChatSurveyPanePreset2 = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPanePreset2.args = presetTwoPreChatSurveyPaneProps;

/*
    Preset Three PreChatSurvey Pane
*/
export const PreChatSurveyPanePreset3 = PreChatSurveyPaneTemplate.bind({});
PreChatSurveyPanePreset3.args = presetThreePreChatSurveyPaneProps;
