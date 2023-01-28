import { IOOOHPaneProps } from "./interfaces/IOOOHPaneProps";
import { Meta } from "@storybook/react/types-6-0";
import OOOHPane from "./OOOHPane";
import React from "react";
import { Story } from "@storybook/react";
import { defaultOOOHPaneProps } from "./common/defaultProps/defaultOOOHPaneProps";
import { encodeComponentString } from "../../common/encodeComponentString";
import { presetOneOOOHPaneProps } from "./common/presetOneProps/presetOneOOOHPaneProps";
import { presetTwoOOOHPaneProps } from "./common/presetTwoProps/presetTwoOOOHPaneProps";
import { presetFourOOOHPaneProps } from "./common/presetFourProps/presetFourOOOHPaneProps";

export default {
    title: "Stateless Components/OutOfOfficeHours Pane",
    component: OOOHPane,
} as Meta;

const OOOHPaneTemplate: Story<IOOOHPaneProps> = (args) => <OOOHPane {...args}></OOOHPane>;

/*
    Default OOOH Pane
*/
export const OOOHPaneDefault = OOOHPaneTemplate.bind({});
OOOHPaneDefault.args = defaultOOOHPaneProps;

/*
    OOOH Pane Preset 1
*/

export const OOOHPanePreset1 = OOOHPaneTemplate.bind({});
OOOHPanePreset1.args = presetOneOOOHPaneProps;

/*
    OOOH Pane Preset 2
*/

export const OOOHPanePreset2 = OOOHPaneTemplate.bind({});
OOOHPanePreset2.args = presetTwoOOOHPaneProps;

/*
    OOOH Pane Preset 3
*/

const customTitle = encodeComponentString(
    <h2 style={{textAlign: "center"}}>
        Hello world
    </h2>
);


const loadingPanePreset3Props: IOOOHPaneProps = {
    componentOverrides: {
        title: customTitle
    }
};

export const OOOHPanePreset3 = OOOHPaneTemplate.bind({});
OOOHPanePreset3.args = loadingPanePreset3Props;

/*
    OOOH Pane Preset 4
*/

export const OOOHPanePreset4 = OOOHPaneTemplate.bind({});
OOOHPanePreset4.args = presetFourOOOHPaneProps;