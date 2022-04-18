import ProactiveChatPane from "./ProactiveChatPane";
import { IProactiveChatPaneProps } from "./interfaces/IProactiveChatPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";
import { Story } from "@storybook/react";
import { defaultProactiveChatPaneProps } from "./common/default/defaultProps/defaultProactiveChatPaneProps";
import { presetOneProactiveChatPaneProps } from "./common/presetOne/presetOneProps/presetOneProactiveChatPaneProps";
import { presetTwoProactiveChatPaneProps } from "./common/presetTwo/presetTwoProps/presetTwoProactiveChatPaneProps";
import { presetThreeProactiveChatPaneProps } from "./common/presetThree/presetThreeProps/presetThreeProactiveChatPaneProps";

export default {
    title: "Stateless Components/Proactive Chat Pane",
    component: ProactiveChatPane,
} as Meta;

const ProactiveChatPaneTemplate: Story<IProactiveChatPaneProps> = (args) => <ProactiveChatPane {...args}></ProactiveChatPane>;

/*
    Default Proactive Chat Pane
*/

export const Default = ProactiveChatPaneTemplate.bind({});
Default.args = defaultProactiveChatPaneProps;

/*
    Default Rtl Proactive Chat Pane
*/

const defaultRtlProps = {
    controlProps: {
        ...defaultProactiveChatPaneProps.controlProps,
        dir: "rtl"
    },
    styleProps: {
        ...defaultProactiveChatPaneProps.styleProps
    }
};

export const DefaultRtl = ProactiveChatPaneTemplate.bind({});
DefaultRtl.args = defaultRtlProps;

/*
    Proactive Chat Pane Pane Preset 1: Horizontal layout for the buttons
*/

export const Preset1 = ProactiveChatPaneTemplate.bind({});
Preset1.args = presetOneProactiveChatPaneProps;

/*
    Proactive Chat Pane Pane Preset 2: custom element that overrides the icon
*/

export const Preset2 = ProactiveChatPaneTemplate.bind({});
Preset2.args = presetTwoProactiveChatPaneProps;

/*
    Proactive Chat Pane Pane Preset 3: round border
*/

export const Preset3 = ProactiveChatPaneTemplate.bind({});
Preset3.args = presetThreeProactiveChatPaneProps;